"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline_sync_1 = require("readline-sync");
function main() {
    var firstStr = (0, readline_sync_1.question)('Enter first number:\n');
    var operator = (0, readline_sync_1.question)('Enter operator (+, -, *, /):\n');
    var secondStr = (0, readline_sync_1.question)('Enter second number:\n');
    var validInput = isNumber(firstStr) && isOperator(operator) && isNumber(secondStr);
    console.log(validInput);
    if (validInput) {
        var firstNum = parseInt(firstStr);
        var secondNum = parseInt(secondStr);
        var result = calculate(firstNum, secondNum, operator);
        console.log("Result: ".concat(result));
    }
    else {
        console.log('Invalid Input\n');
        main();
    }
}
function isNumber(str) {
    var maybenum = parseInt(str);
    return !isNaN(maybenum);
}
function isOperator(operator) {
    switch (operator) {
        case "+":
        case "-":
        case "*":
        case "/":
            return true;
        default:
            return false;
    }
}
function calculate(firstNum, secondNum, operator) {
    switch (operator) {
        case "+":
            return firstNum + secondNum;
        case "-":
            return firstNum - secondNum;
        case "*":
            return firstNum * secondNum;
        case "/":
            return firstNum / secondNum;
        default:
            return 0;
    }
}
main();
