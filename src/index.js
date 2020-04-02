export var sum = function (a, b) {
    if ('development' === process.env.NODE_ENV) {
        console.log('boop');
    }
    else {
        console.log("p");
    }
    return a + b;
};
console.log("hello world");
sum(1, 2);
//# sourceMappingURL=index.js.map