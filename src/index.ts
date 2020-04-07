// @ts-ignore
import axios from 'axios'
import chalk from 'chalk'
// @ts-ignore
import clear from 'clear'
// @ts-ignore
import figlet from 'figlet'
import secretJson from './env.json'
clear()
console.log(chalk.red(figlet.textSync('secrets', { horizontalLayout: 'full' })))
const GITHUB_API = 'https://api.github.com'
// console.log(secrets)
const getEnvArray = () => {
  const envArray = Object.entries(secretJson)
  console.log(envArray)
  return envArray

  throw 'no secrets'
}

const getOwnerAndRepoName = () => {
  // const remoteURL = cmd.runCommand('git config --get remote.origin.url')
  // return remoteURL
  //   .replace('https://github.com/', '')
  //   .replace('.git', '')
  //   .trim()
  //   .split('/')
  return ['HFG-InfoTech', 'pcs-hybrid']
}

interface PublicKey {
  key_id: string
  key: string
}

const getPublicKey = async () => {
  const [owner, repo] = getOwnerAndRepoName()
  try {
    const response = await axios.request<PublicKey>({
      url: `${GITHUB_API}/repos/${owner}/${repo}/actions/secrets/public-key`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
      },
    })
    console.log(response.data)
    return response.data
  } catch (e) {
    console.log(e)
    return
  }
}
const postSecrets = async (secrets: any, publicKey: PublicKey) => {
  const sodium = require('tweetsodium')
  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const ownerRepo = getOwnerAndRepoName()
  // console.log(secrets)
  return Promise.all(
    secrets.map(async secret => {
      try {
      console.log(secret)
        const messageBytes = Buffer.from(
          typeof secret[1] === 'object' ? JSON.stringify(secret[1], null, 2) : secret[1]
        )
        const keyBytes = Buffer.from(publicKey.key, 'base64')

        // Encrypt using LibSodium.
        if (!messageBytes || !keyBytes) {
          console.log('broken', secret)
        }
        const encryptedBytes = sodium.seal(messageBytes, keyBytes)

        // Base64 the encrypted secret
        const encryptedValue = Buffer.from(encryptedBytes).toString('base64')

        const response = await axios.put(
          `${GITHUB_API}/repos/${ownerRepo[0]}/${ownerRepo[1]}/actions/secrets/${secret[0]}`,
          {
            key_id: publicKey.key_id,
            encrypted_value: encryptedValue,
          },
          {
            headers: {
              Authorization: `Bearer 286d4aaf133e421c15282a24c964b00f5b136930`,
            },
          }
        )
        console.log(response.status)
      } catch (e) {
        console.log("failed", secret)
        console.log(JSON.stringify(e, null, 2))
        return
      }
      })
    )
}

const main = async () => {
  const envsToEncrypt = getEnvArray()
  const publicKey = await getPublicKey()
  if (publicKey) {
    await postSecrets(envsToEncrypt, publicKey)
  }
}

main()
