'use strict'

const operations = [ '+', '-', '*', '/', '^' ];
var solutions = [];

main(process.argv);

function main(args) {
    let equation = parseEquation(args[2]);
    let equations = r(equation);
    for (let solution of solutions) {
        console.log(solution.join(' '));
    }
}

function r(main) {
    console.log('\nr(): ', main);
    if (!main) {
        return '';
    }

    let left = [];
    for (let i in main) {
        i = parseInt(i);
        let token = main[i];
        console.log('token[' + i + ']: ' + token + '           main.length: ' + main.length);

        if (typeof token === "number") {
            if ((i + 1) === main.length) {
                console.log('  - Return i == m.l\n');
                return left.concat(token);
            }

            let leftSide = [];
            if (left.length !== 0) {
                console.log('Invoking left: ', left);
                leftSide = r(left);
                console.log('leftSide response: ', leftSide);
            } else {
                console.log('leftSide: ', leftSide);
            }

            let middle = [...main].slice(i, parseInt(i) + 3);
            middle = [ '(' ].concat(middle).concat([ ')' ]);
            console.log('middle value: ', middle);

            let right = [...main].slice(parseInt(i) + 3);
            console.log('Invoking right: ', right);
            let rightSide = r(right);
            console.log('rightSide response: ', rightSide);

            let answer = leftSide.concat(middle).concat(rightSide);
            console.log('combination: ', answer);

            solutions.push(answer);
        }

        left.push(token);
        console.log('left: ', left);
    }

    console.log('  - No more tokens\n');
    return left;
}




// Turns equation string into an array of equation tokens
// "1 + (2 * 4)" -> [ 1, '+', '(', 2, '*', 4, ')' ]
function parseEquation(s) {
    let equation = [];

    let n = 0;
    let parens = 0;
    for (let ch of s) {

        if (ch >= '0' && ch <= '9') {
            if (n > 0) {
                n *= 10;
            }
            n += parseInt(ch);
            continue;
        }

        if (n > 0) {
            equation.push(n);
            n = 0;
        }

        // Skip spaces
        if (ch === ' ') {
            continue;
        }

        // Handle parenthesis
        if (ch === '(') {
            parens++;
            equation.push(ch);
            continue;
        }

        if (ch === ')') {
            parens--;
            equation.push(ch);
            continue;
        }

        // Handle operators
        if (operations.includes(ch)) {
            equation.push(ch);
            continue;
        }

        console.log('Unknown character in equation: ' + ch);
        process.exit(1);
    }

    if (n > 0) {
        equation.push(n);
    }

    if (parens !== 0) {
        console.log('Unbalanced parens');
        process.exit(1);
    }

    return equation;
}
// Turns equation string into an array of equation tokens
// "1 + (2 * 4)" -> [ 1, '+', '(', 2, '*', 4, ')' ]
function parseEquation(s) {
    let equation = [];

    let n = 0;
    let parens = 0;
    for (let ch of s) {

        if (ch >= '0' && ch <= '9') {
            if (n > 0) {
                n *= 10;
            }
            n += parseInt(ch);
            continue;
        }

        if (n > 0) {
            equation.push(n);
            n = 0;
        }

        // Skip spaces
        if (ch === ' ') {
            continue;
        }

        // Handle parenthesis
        if (ch === '(') {
            parens++;
            equation.push(ch);
            continue;
        }

        if (ch === ')') {
            parens--;
            equation.push(ch);
            continue;
        }

        // Handle operators
        if (operations.includes(ch)) {
            equation.push(ch);
            continue;
        }

        console.log('Unknown character in equation: ' + ch);
        process.exit(1);
    }

    if (n > 0) {
        equation.push(n);
    }

    if (parens !== 0) {
        console.log('Unbalanced parens');
        process.exit(1);
    }

    return equation;
}
