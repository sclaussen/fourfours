'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'infix';

const d = require('debug')('infix');
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const fmtc = require('./expression').fmtc;


// Tests
// fmtc(generateInfixPermutations([ [ 4, 4, 4, 4 ] ]));
// fmtc(generateInfixPermutations([ [4, 4, 4, 4], [ 4444 ] ]));
// fmtc(generateInfixPermutations([ [4, 4, 4, 4], [4, 4, 44], [ 44, 44], [ 4444 ] ]));


function generateInfixPermutations(expressions) {
    let newExpressions = [];
    for (let expression of expressions) {
        let response = generateInfixPermutationsRecursively(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }
    return newExpressions;
}


function generateInfixPermutationsRecursively(expression, newExpression, stack) {
    newExpression.push(expression[0]);
    expression.shift();
    if (expression.length === 0) {
        return [ newExpression ];
    }

    let expressions = [];
    for (let operator of constants.infixOperators) {

        if (operator === '!' && isFloat(expressionCopy[0])) {
            continue;
        }

        let expressionCopy = [...expression];
        let newExpressionCopy = [...newExpression];
        newExpressionCopy.push(operator);
        let response = generateInfixPermutationsRecursively(expressionCopy, newExpressionCopy, ++stack);

        expressions = expressions.concat(response);
    }

    return expressions;
}


function isFloat(n) {
    return n.toString().includes('.');
}


module.exports.generateInfixPermutations = generateInfixPermutations;
