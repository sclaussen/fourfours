'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'postfix';


const d = require('debug')('postfix');
const p = require('./util').p(d);
const pc = require('./util').pc(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const pfmt = require('./expression').pfmt;
const pfmtc = require('./expression').pfmtc;

const paren = require('./paren');
const parse = require('./expression').parse;


// Tests
// pfmtc(postfix(paren('4+4+4')));
// pfmtc(postfix(paren('4+4+4+4')));


function postfix(expressions) {
    if (typeof expressions === 'string') {
        expressions = [ parse(expressions) ];
    }

    let newExpressions = [];
    for (let expression of expressions) {
        let response = postfixRecursive(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }

    let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
    let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);

    return newExpressionsUnique;
}


function postfixRecursive(expression, newExpression, stack, comment) {
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

        // For a ( or number break to insert the postfix operator(s)
        if (token === ')' || typeof token === 'number') {
            break;
        }

        console.error('ERROR: Encountered unknown token in the expression: ' + token);
        process.exit(1);
    }



    // Remove all the tokens added to the newExpression from
    // the original expression
    expression.splice(0, tokenCount);
    if (expression.length === 0) {
        ex('postfixRecursive (mid)', stack + ': [' + newExpression + '] ' + comment);
        return [ newExpression ];
    }


    let token = expression[0];
    let expressions = [];
    for (let operator of constants.postfixOperators) {


        // Do not generate an expression for factorial of a float
        if (typeof token === 'number') {
            if (!Number.isInteger(token)) {
                continue;
            }
        }

        let expressionLeftCopy = [...expression];
        let newExpressionLeftCopy = [...newExpression];
        newExpressionLeftCopy.push(token);
        newExpressionLeftCopy.push(operator);
        expressionLeftCopy.shift();
        let leftResponse = postfixRecursive(expressionLeftCopy, newExpressionLeftCopy, (stack + 1), 'left');
        expressions = expressions.concat(leftResponse);
    }


    // Invoke the next level of recursion WITHOUT adding the operator
    // to permutate the generated expressions
    let expressionRightCopy = [...expression];
    let newExpressionRightCopy = [...newExpression];
    newExpressionRightCopy.push(token);
    expressionRightCopy.shift();
    let rightResponse = postfixRecursive(expressionRightCopy, newExpressionRightCopy, (stack + 1), 'right');
    expressions = expressions.concat(rightResponse);

    return expressions;
}


module.exports = postfix;
