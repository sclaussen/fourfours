'use strict'


const operations = [ '+', '-', '*', '/', '^' ];
var solutions = [];


main();


function main() {
    fours();
}


function fours() {
    for (let goal = 0; goal <= 100; goal++) {
        if (solve(goal) == false) {
            solutions.push(goal + ': Not Found');
        }
    }

    for (let solution of solutions) {
        console.log(solution);
    }
}


function solve(goal) {
    let solved = false;
    for (let op1 of operations) {
        for (let op2 of operations) {
            for (let op3 of operations) {
                for (let i = 1; i <= 3; i++) {
                    for (let j = 1; j <= 3; j++) {
                        if (i === j) {
                            continue;
                        }
                        for (let k = 1; k <= 3; k++) {
                            if (i === k || j === k) {
                                continue;
                            }

                            if (solveExpression(op1, op2, op3, [ i, j, k ], goal)) {
                                solved = true;
                            }
                        }
                    }
                }
            }
        }
    }

    return solved;
}


function solveExpression(op1, op2, op3, sequence, goal) {
    let answer;
    let answer2;
    switch (sequence[0]) {
    case 1:
        answer = evaluate(4, op1, 4);
        if (sequence[1] === 2) {
            // 1, 2, 3
            answer = evaluate(answer, op2, 4);
            answer = evaluate(answer, op3, 4);
        } else {
            // 1, 3, 2
            answer2 = evaluate(4, op3, 4);
            answer = evaluate(answer, op2, answer2);
        }
        break;
    case 2:
        answer = evaluate(4, op2, 4);
        if (sequence[1] === 1) {
            // 2, 1, 3
            answer = evaluate(4, op1, answer);
            answer = evaluate(answer, op3, 4);
        } else {
            // 2, 3, 1
            answer = evaluate(answer, op3, 4);
            answer = evaluate(4, op1, answer);
        }
        break;
    case 3:
        answer = evaluate(4, op3, 4);
        if (sequence[1] === 1) {
            // 3, 1, 2
            answer2 = evaluate(4, op1, 4);
            answer = evaluate(answer2, op2, answer);
        } else {
            // 3, 2, 1
            answer = evaluate(4, op2, answer);
            answer = evaluate(4, op1, answer);
        }
        break;
    }

    if (answer === goal) {
        solutions.push(goal + ' = '+ addParens([ '4', op1, '4', op2, '4', op3, '4' ], sequence).join(' '));
        return true;
    }

    return false;
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
        // Handle divide by zero!!!
        return n1 / n2;
    case '^':
        return Math.pow(n1, n2);
    }
}


function factorial(n) {
    if (n === 0) {
        return 1;
    }

    return n * factorial(n - 1);
}


function addParens(eq, seq) {
    for (let n of seq) {
        n = parseInt(n);

        let ops = 0;
        for (let i in eq) {
            i = parseInt(i);
            let token = eq[i];
            if (operations.includes(token)) {
                ops++;
                if (ops !== n) {
                    continue;
                }

                // walk back
                let parens = 0;
                let parenAdded = false;
                for (let j = i - 1; j >= 0; j--) {
                    let token2 = eq[j];

                    if (token2 === ')') {
                        parens++;
                        continue;
                    }

                    if (token2 === '(') {
                        parens--;
                        if (parens === 0) {
                            eq.splice(j, 0, '(');
                            parenAdded = true;
                            break;
                        }
                        continue;
                    }

                    // If there are still open parens continue on
                    // (looking for the left paren that closes things
                    // up)
                    if (parens !== 0) {
                        continue;
                    }

                    // Skip operators
                    if (operations.includes(token2)) {
                        continue;
                    }

                    // Must have found a number, if no open parens we can insert ours
                    eq.splice(j, 0, '(');
                    parenAdded = true;
                    break;
                }

                if (!parenAdded) {
                    eq.unshift('(');
                }


                // walk forward
                parens = 0;
                parenAdded = false;
                for (let k = i + 1; k < eq.length; k++) {
                    let token2 = eq[k];

                    if (token2 === '(') {
                        parens++;
                        continue;
                    }

                    if (token2 === ')') {
                        parens--;
                        if (parens === 0) {
                            eq.splice(k + 1, 0, ')');
                            parenAdded = true;
                            break;
                        }
                        continue;
                    }

                    // If there are still open parens continue on
                    // (looking for the right paren that closes things
                    // up)
                    if (parens !== 0) {
                        continue;
                    }

                    // Skip operators
                    if (operations.includes(token2)) {
                        continue;
                    }

                    // Must have found a number, if no open parens we can insert ours
                    eq.splice(k + 1, 0, ')');
                    parenAdded = true;
                    break;
                }

                if (!parenAdded) {
                    eq.push(')');
                }
            }
        }
    }

    return eq;
}
