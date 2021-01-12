'use strict'


const operations = [ '+', '-', '*', '/', '^' ];
var solutions = [];


main();


function main() {
    fours();
}


function fours() {
    for (let goal = 0; goal <= 10; goal++) {
        solve(goal);
    }

    for (let solution of solutions) {
        console.log(solution);
    }
}


function solve(goal) {
    for (let op1 of operations) {
        for (let op2 of operations) {
            for (let op3 of operations) {
                let answer = calculate(op1, op2, op3);
                if (answer === goal) {
                    solutions.push('4 ' + op1 + ' 4 ' + op2 + ' 4 ' + op3 + ' 4 = ' + answer);
                }
            }
        }
    }
}


function calculate(op1, op2, op3) {
    let answer = evaluate(4, op1, 4);
    answer = evaluate(answer, op2, 4);
    answer = evaluate(answer, op3, 4);
    return answer;
}


function evaluate(n1, op, n2) {
    switch (op) {
    case '+':
        return n1 + n2;
    case '-':
        return n1 - n2;
    case '*':
        return n1 * n2;
    case '/':
        return n1 / n2;
    case '^':
        return Math.pow(n1, n2);
    }
}
