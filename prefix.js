'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'prefix';


const d = require('debug')('prefix');
const p = require('./util').p(d);
const pc = require('./util').pc(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const fmtc = require('./expression').fmtc;
const parse = require('./expression').parse;


// Tests
// fmtc(generatePrefixPermutations([ parse('(((4*4)*4)*4)') ]));
// fmtc(generatePrefixPermutations([ [ 4, '+', 4, '+', 4, '+', 4 ] ]));
// fmtc(generatePrefixPermutations([ [ 4, '+', 4, '+', 4, '+', 4 ], [ 44, '*', 4, '/', 4] ]));


function generatePrefixPermutations(expressions) {
    let newExpressions = [];
    for (let expression of expressions) {
        let response = generatePrefixPermutationsRecursively(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }

    // Remove duplicate expressions
    let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
    let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);

    return newExpressionsUnique;
}


function generatePrefixPermutationsRecursively(expression, newExpression, stack) {
    if (expression.length === 0) {
        return [ newExpression ];
    }


    // Iterate through the expression until we find a spot where the
    // prefix operation can be applied.  Valid spots:
    // - Before (
    // - Before a Number
    let tokenCount = 0;
    for (let token of expression) {

        if (constants.infixOperators.includes(token) || constants.postfixOperators.includes(token)) {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === ')') {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        // Must be at either a number or open paren
        break;
    }



    let expressionCopy = [...expression];
    expressionCopy.splice(0, tokenCount);
    if (expressionCopy.length === 0) {
        return [ newExpression ];
    }


    let expressions = [];
    for (let operator of constants.prefixOperators) {

        if (operator === 'sum' && isFloat(expressionCopy[0])) {
            continue;
        }

        let newExpressionLeftCopy = [...newExpression];
        newExpressionLeftCopy.push(operator);
        newExpressionLeftCopy.push(expressionCopy[0]);
        let expressionLeftCopy = expressionCopy.slice(1);
        let leftResponse = generatePrefixPermutationsRecursively(expressionLeftCopy, newExpressionLeftCopy, ++stack);
        expressions = expressions.concat(leftResponse);

        let newExpressionRightCopy = [...newExpression];
        newExpressionRightCopy.push(expressionCopy[0]);
        let expressionRightCopy = expressionCopy.slice(1);
        let rightResponse = generatePrefixPermutationsRecursively(expressionRightCopy, newExpressionRightCopy, ++stack);
        expressions = expressions.concat(rightResponse);
    }

    return expressions;
}


function isFloat(n) {
    return n.toString().includes('.');
}


module.exports.generatePrefixPermutations = generatePrefixPermutations;
