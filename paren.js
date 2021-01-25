'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'paren';

const d = require('debug')('paren');
const pc = require('./util').pc(d);
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const xc = require('./util').xc;
const x = require('./util').x;
const xs = require('./util').xs;

const parse = require('./expression').parse;

const simple = require('./rules').simple;
const adv = require('./rules').advanced;


var rules;


// Tests
// xc(paren(simple)('4+4+4+4'));
// xc(paren([ parse('4+4+4+4'), parse('44+4+4'), parse('4444') ]));


function paren(r) {
    rules = r;

    return function(expressions) {
        let orders = [
            generateOrderPermutationsRecursively([], [], 1),
            generateOrderPermutationsRecursively([ 1 ], [], 1),
            generateOrderPermutationsRecursively([ 1, 2 ], [], 1),
            generateOrderPermutationsRecursively([ 1, 2, 3 ], [], 1),
        ];

        if (typeof expressions === 'string') {
            expressions = [ parse(expressions) ];
        }

        let newExpressions = [];
        for (let expression of expressions) {
            let operatorCount = getOperatorCount(expression);
            for (let order of orders[operatorCount]) {
                let newExpression = generateParenPermutation([...expression], order);
                newExpressions.push(newExpression);
            }
        }

        let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
        let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);

        return newExpressionsUnique;
    }
}


function generateOrderPermutationsRecursively(numbers, order, stack) {
    if (order.length === numbers.length) {
        return [ order ];
    }

    let orders = [];
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];

        if (order.includes(number)) {
            continue;
        }

        let orderCopy = [...order];
        orderCopy.push(number);

        let response = generateOrderPermutationsRecursively(numbers, orderCopy, (stack + 1));

        orders = orders.concat(response);
    }

    return orders;
}


function generateParenPermutation(expression, order) {
    for (let i = 0; i < order.length; i++) {
        let number = order[i];

        // Find the nth operator to add parens around
        let operatorCount = 0;
        let operatorIndex = 0;
        for (let j = 0; j < expression.length; j++) {
            if (rules.infixOperators.includes(expression[j])) {
                if (++operatorCount === number) {
                    operatorIndex = j;
                    break;
                }
            }
        }

        // Walk back from operator to insert open paren
        let depth = 0;
        let parenAdded = false;
        for (let j = operatorIndex - 1; j >= 0; j--) {
            switch (expression[j]) {
            case ')':
                depth++;
                continue;
            case '(':
                depth--;
            }

            // Depth of zero, left of number, (, or at beginning, insert open paren prior
            if (depth === 0 && (typeof expression[j] === 'number' || expression[j] === '(' || j === 0)) {
                expression.splice(j, 0, '(');
                break;
            }
        }

        // Walk forward from operator to insert close paren
        depth = 0;
        parenAdded = false;
        for (let j = operatorIndex + 1; j < expression.length; j++) {
            switch (expression[j]) {
            case '(':
                depth++;
                continue;
            case ')':
                depth--;
            }

            // Depth of zero, right of number or ), or at very end, insert closing paren
            if (depth === 0 && (typeof expression[j] === "number" || expression[j] === ')' || j === (expression.length - 1))) {
                expression.splice(j + 1, 0, ')');
                break;
            }
        }
    }

    return expression;
}


function getOperatorCount(expression) {
    let operatorCount = 0;
    for (let token of expression) {
        if (rules.infixOperators.includes(token)) {
            operatorCount++;
        }
    }
    return operatorCount;
}


module.exports = paren;
