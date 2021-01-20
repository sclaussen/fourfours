'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'postfix';


const d = require('debug')('postfix');
const p = require('./util').p(d);
const pc = require('./util').pc(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const fmtc = require('./expression').fmtc;


// Tests
fmtc(generatePostfixPermutations([ [ 4, '+', 4, '+', 4, '+', 4 ] ]));
// fmtc(generatePostfixPermutations([ [ 4, '+', 4, '+', 4, '+', 4 ], [ 44, '*', 4, '/', 4] ]));


function generatePostfixPermutations(expressions) {
    let newExpressions = [];
    for (let expression of expressions) {
        let response = generatePostfixPermutationsRecursively(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }

    let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
    let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);

    return newExpressionsUnique;
}


function generatePostfixPermutationsRecursively(expression, newExpression, stack) {
    if (expression.length === 0) {
        return [ newExpression ];
    }


    // Iterate through the expression until we find a spot where the
    // postfix operation can be applied.  Valid spots:
    // - After )
    // - After a Number
    let tokenCount = 0;
    for (let token of expression) {

        if (constants.infixOperators.includes(token) || constants.prefixOperators.includes(token)) {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === '(') {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        // Must be at either a number or closed paren
        break;
    }



    let expressionCopy = [...expression];
    expressionCopy.splice(0, tokenCount);
    if (expression.length === 0) {
        return [ newExpression ];
    }


    let expressions = [];
    for (let operator of constants.postfixOperators) {

        let newExpressionLeftCopy = [...newExpression];
        newExpressionLeftCopy.push(expressionCopy[0]);
        newExpressionLeftCopy.push(operator);
        let expressionLeftCopy = expressionCopy.slice(1);
        let leftResponse = generatePostfixPermutationsRecursively(expressionLeftCopy, newExpressionLeftCopy, ++stack);
        expressions = expressions.concat(leftResponse);

        let newExpressionRightCopy = [...newExpression];
        newExpressionRightCopy.push(expressionCopy[0]);
        let expressionRightCopy = expressionCopy.slice(1);
        let rightResponse = generatePostfixPermutationsRecursively(expressionRightCopy, newExpressionRightCopy, ++stack);
        expressions = expressions.concat(rightResponse);
    }

    return expressions;
}


module.exports.generatePostfixPermutations = generatePostfixPermutations;
