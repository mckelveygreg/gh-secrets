// @ts-ignore
import chalk from 'chalk';
// @ts-ignore
import clear from 'clear';
// @ts-ignore
import * as envfile from 'envfile';
// @ts-ignore
import figlet from 'figlet';

clear();
console.log(
  chalk.red(figlet.textSync('secrets', { horizontalLayout: 'full' }))
);

const sourcePath = '.env';
const envObj: object = envfile.parseFileSync(sourcePath);
const envArray = Object.entries(envObj);

envArray.map(env => console.log(env));
