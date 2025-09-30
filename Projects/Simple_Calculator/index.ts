import { question } from 'readline-sync';



type Operator = '+' | '-' | '/' | '*';

function main(): void {
    const firstStr: string = question('Enter first number:\n');
    const operator: string = question('Enter operator (+, -, *, /):\n');
    const secondStr: string = question('Enter second number:\n');

    const validInput: boolean = isNumber(firstStr) && isOperator(operator) && isNumber(secondStr);

    console.log(validInput);

    if (validInput) {
        const firstNum: number = parseInt(firstStr);
        const secondNum: number = parseInt(secondStr);
        const result = calculate(firstNum, secondNum, operator as Operator);
        console.log(`Result: ${result}`);
    } else {
        console.log('Invalid Input\n');
        main();
    }
}

function isNumber(str: string): boolean {
    const maybenum = parseInt(str);
    return !isNaN(maybenum);
}

function isOperator(operator: string): boolean {
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

function calculate(firstNum: number, secondNum: number, operator: Operator): number {
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
