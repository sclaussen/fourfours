'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'infix';

const d = require('debug')('infix');
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const pfmt = require('./expression').pfmt;
const pfmtc = require('./expression').pfmtc;


// Tests
// pfmtc(infix([ [ 4, 4, 4, 4 ] ]));
// pfmtc(infix([ [ 44, 44 ] ]));
// pfmtc(infix([ [4, 4, 4, 4], [ 4444 ] ]));
// pfmtc(infix([ [4, 4, 4, 4], [4, 4, 44], [ 44, 44], [ 4444 ] ]));


function infix(expressions) {
    let newExpressions = [];
    for (let expression of expressions) {
        let response = infixRecursive(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }
    return newExpressions;
}


function infixRecursive(expression, newExpression, stack) {
    newExpression.push(expression[0]);
    expression.shift();
    if (expression.length === 0) {
        return [ newExpression ];
    }

    let expressions = [];
    for (let operator of constants.infixOperators) {

        let newExpressionCopy = [...newExpression];
        newExpressionCopy.push(operator);
        let response = infixRecursive([...expression], newExpressionCopy, ++stack);

        expressions = expressions.concat(response);
    }

    return expressions;
}


module.exports = infix;
