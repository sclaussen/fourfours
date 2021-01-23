'use strict'
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'evaluate';


const d = require('debug')('evaluate');
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const parse = require('./expression').parse;
const fmt = require('./expression').fmt;

var factorialCache = {};
var sumCache = {};


// Tests
p(evaluate('sum 100'));
// p(evaluate('((sqrt ((square (4 + 4!))) + 4!)) + 4))');
// p(evaluate('(4 - 444)!'));
// p(evaluate('((((sqrt 4)! * (sqrt 4)!)! * (sqrt 4)!)! * (sqrt 4!))!'));
// p(evaluate('sqrt (sqrt (sum (sum 4! * sum 4!)! * sqrt 4!)! * sqrt 4!)!'));
// p(evaluate('sqrt (sum (square (sqrt 4 * 4)! * 4!) * sqrt 4!)!'));
// p(evaluate('sum 4'));
// p(evaluate('1 + 2'));
// p(evaluate('(1 + 2)'));
// p(par('(sqrt 2 * square 2)'));
// p(evaluate('(1 + (2 + 3))'));
// p(evaluate('(1 + (2 + 3) + (4 + 5))'));
// p(evaluate('(1 + (2 + 3) * ((4 + 5) + 6 * 7))'));
// p(evaluate('(1 + square 2 + sqrt 4 + sum 4)'));
// p(evaluate('(1 + 4! * 2)'));
// p(evaluate('(4 - 2 * 6)'));
// ((square ((square (4! + 4!))) + 4!))) + 4!))))



function evaluate(expression) {
    let expressionArray;
    let result;
    if (typeof expression === 'string') {
        expression = parse(expression);
        result = evaluateArray(expression);
    } else {
        result = evaluateArray([...expression]);
    }

    return result;
}


function evaluateArray(expression) {
    e('evaluateArray', fmt(expression));
    while (true) {
        expression = findAndEvaluateSubexpression(expression);
        if (expression.length === 1) {
            return expression[0];
        }
        if (expression.length === 3 && expression[0] === '(' && expression[2] === ')') {
            return expression[1];
        }
    }
}


function findAndEvaluateSubexpression(expression) {

    // Corner case where all the sub-expressions have been evaluated
    // and there's a single value left in the expression array
    if (expression.length ===  1) {
        return expression;
    }

    // Determine the start and end array indexes of the expression at
    // the maximum parenthetical depth (inclusive of parenthesis) that
    // should be evaluated first.
    let maxDepth = 0;
    let depth = 0;
    let start = 0;
    let end = 0;
    for (let i in expression) {
        i = parseInt(i);
        let token = expression[i];

        switch (token) {
        case '(':
            depth++;
            if (depth > maxDepth) {
                start = i;
                end = 0;
                maxDepth = depth;
            }
            continue;
        case ')':
            if (depth === maxDepth && end === 0) {
                end = parseInt(i) + 1;
            }
            depth--;
            continue;
        }

        // Handle the corner case where there are no parenthesis
        if (i == (expression.length - 1) && end == 0) {
            end = expression.length;
        }
    }


    // Here we could be evaluating something like this:
    // - 2 + 3
    // - (2 + 3)
    // - 2 + 3 * 4
    // - (2 + sqrt 3 * 4!)
    let evaluatedSubexpression = evaluateSubexpression(expression.slice(start, end));


    // Remove extraneous parenthesis from the evaluated subexpression to handle this case:
    // (9) -> 9
    if (evaluatedSubexpression.length === 3 && evaluatedSubexpression[0] === '(' && evaluatedSubexpression[2] === ')') {
        evaluatedSubexpression = [ evaluatedSubexpression[1] ];
        p('Removing parens: ' + evaluatedSubexpression);
    }

    // Substitue the subexpression with the evaluated subexpression:
    // - 2 + 3 -> 5
    // - (2 + 3) -> 5
    // - 2 + 3 * 4 -> 2 + 12
    // - (2 + sqrt 3 * 4!) -> (2 + sqrt 3 * 24)
    while (true) {
        expression = resolveSubexpression(expression, evaluatedSubexpression, start, end)
        p('expression returned: ' + expression);
        if (evaluatedSubexpression.length === 3 && evaluatedSubexpression[0] === '(' && evaluatedSubexpression[2] === ')') {
            evaluatedSubexpression = [ evaluatedSubexpression[1] ];
            p('Removing parens: ' + evaluatedSubexpression);
            continue;
        }
        break;
    }

    return expression;
}


function evaluateSubexpression(expression) {
    e('evaluateSubexpression', fmt(expression));

    // Search for a factorial operator, if found, evaluate, and return
    let previousNumber = 0;
    for (let i in expression) {
        let token = expression[i];

        if (typeof token === 'number') {
            previousNumber = token;
            continue;
        }

        if (token === '!') {
            let answer = evaluateFactorial(previousNumber);
            expression.splice(parseInt(i) - 1, 2, answer);
            ex('evaluateSubexpression', expression);
            return expression;
        }
    }


    // Search for a function, if found, evaluate, and return
    for (let i in expression) {
        let token = expression[i];
        if (constants.prefixOperators.includes(token)) {
            let answer = evaluateFunction(token, expression[parseInt(i) + 1]);
            expression.splice(i, 2, answer);
            return expression;
        }
    }


    // Handle ^ in left associate manner
    previousNumber = 0;
    for (let i in expression) {
        let token = expression[i];

        if (typeof token === 'number') {
            previousNumber = token;
            continue;
        }

        if (token === '^') {
            let nextNumber = expression[parseInt(i) + 1];
            let answer = evaluateInfix(previousNumber, token, nextNumber);
            expression.splice(parseInt(i) - 1, 3, answer);
            return expression;
        }
    }


    // Handle * and / in a left associative manner
    previousNumber = 0;
    for (let i in expression) {
        let token = expression[i];

        if (typeof token === 'number') {
            previousNumber = token;
            continue;
        }

        if (token === '*' || token === '/') {
            let nextNumber = expression[parseInt(i) + 1];
            let answer = evaluateInfix(previousNumber, token, nextNumber);
            expression.splice(parseInt(i) - 1, 3, answer);
            return expression;
        }
    }


    // Handle + and - in a left associative manner
    previousNumber = 0;
    for (let i in expression) {
        let token = expression[i];

        if (typeof token === 'number') {
            previousNumber = token;
            continue;
        }

        if (token === '+' || token === '-') {
            let nextNumber = expression[parseInt(i) + 1];
            let answer = evaluateInfix(previousNumber, token, nextNumber);
            expression.splice(parseInt(i) - 1, 3, answer);
            return expression;
        }
    }

    console.error('Error: Expecting an operator and found none during the inner evaluation of: ' + fmt(expression));

    process.exit(1);
}


function resolveSubexpression(expression, evaluatedSubexpression, start, end) {
    e('resolveSubexpression', evaluatedSubexpression);
    let j = end;
    for (let i in evaluatedSubexpression) {
        let token = evaluatedSubexpression[i];
        expression.splice(j, 0, token);
        j++;
    }

    expression.splice(start, end - start);
    return expression;
}


function evaluateInfix(n1, operator, n2) {
    switch (operator) {
    case '*':
        return n1 * n2;
    case '/':
        if (n2 === 0) {
            throw 'Divide by 0';
        }
        return n1 / n2;
    case '+':
        return n1 + n2;
    case '-':
        return n1 - n2;
    case '^':
        if (n2 > constants.MAX_EXPONENT) {
            throw 'Exponent too large';
        }
        if (n2 < (0 - constants.MAX_EXPONENT)) {
            throw 'Exponent too small';
        }

        return Math.pow(n1, n2);
    }
}


function evaluateFactorial(n) {
    if (!Number.isInteger(n)) {
        throw 'Factorial only supported for integer values';
    }

    if (n < 1) {
        throw 'Factorial only supported for positive integer values';
    }

    if (n > constants.MAX_FACTORIAL) {
        throw 'Factorial number too large';
    }

    return evaluateFactorialIteratively(n);
}


function evaluateFactorialIteratively(n) {
    if (factorialCache[n]) {
        return factorialCache[n];
    }

    let answer = 1;
    for (let i = 2; i <= n; i++) {
        answer *= i;
    }

    factorialCache[n] = answer;
    return answer;
}


function evaluateFunction(functionName, number) {
    switch (functionName) {

    case 'square':
        if (number > constants.MAX_SQUARE) {
            throw 'Base to be squared is too large';
        }

        if (number < (0 - constants.MAX_SQUARE)) {
            throw 'Base to be squared is too small';
        }

        return number * number;

    case 'sqrt':
        if (number < 0) {
            throw 'Square root only supported for values >= 0';
        }

        return Math.sqrt(number);

    case 'sum':
        if (!Number.isInteger(number)) {
            throw 'Summation only supported for integer values';
        }

        if (number > constants.MAX_SUM) {
            throw 'Summation number too large';
        }

        if (number < (0 - constants.MAX_SUM)) {
            throw 'Summation number too small';
        }

        if (sumCache[number]) {
            return sumCache[number];
        }

        let answer = 0;
        if (number < 0) {
            for (let i = number; i < 0; i++) {
                answer += i;
            }
        } else {
            for (let i = number; i > 0; i--) {
                answer += i;
            }
        }

        sumCache[number] = answer;

        return answer;
    }
}


module.exports = evaluate;
