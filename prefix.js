'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'prefix';


const d = require('debug')('prefix');
const p = require('./util').p(d);
const pc = require('./util').pc(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const fmt = require('./expression').fmt;
const pfmt = require('./expression').pfmt;
const pfmtc = require('./expression').pfmtc;

const parse = require('./expression').parse;
const paren = require('./paren');
const postfix = require('./postfix');


// Tests
// pfmtc(prefix('4'));
// pfmtc(postfix(prefix('(4 + 4)')));
// pfmtc(postfix(prefix(paren('4 + 4 + 4 + 4'))));


function prefix(expressions) {
    if (typeof expressions === 'string') {
        expressions = [ parse(expressions) ];
    }

    let newExpressions = [];
    for (let expression of expressions) {
        let response = prefixRecursive(expression, [], 1);
        newExpressions = newExpressions.concat(response);
    }

    // Remove duplicate expressions
    let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
    let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);

    return newExpressionsUnique;
}


function prefixRecursive(expression, newExpression, stack, comment) {
    e('prefixRecursive', stack + ': [' + newExpression + '] [' + expression + '] ' + comment);


    if (expression.length === 0) {
        ex('prefixRecursive (head)', stack + ': [' + newExpression + '] ' + comment);
        return [ newExpression ];
    }


    // Iterate through the expression, adding each token to the new
    // expression, until we find a spot where the prefix operation can
    // be applied.
    //
    // Valid spots:
    // - Before a Number
    // - Before an open parenthesis (
    let tokenCount = 0;
    for (let token of expression) {

        // Add * / + - ^ to the new expression
        if (constants.infixOperators.includes(token)) {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === ')') {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        // For a ( or number break to insert the prefix operator(s)
        if (token === '(' || typeof token === 'number') {
            break;
        }

        console.error('ERROR: Encountered unknown token in the expression: ' + token);
        process.exit(1);
    }


    // Remove all the tokens added to the newExpression from
    // the original expression
    expression.splice(0, tokenCount);
    if (expression.length === 0) {
        ex('prefixRecursive (mid)', stack + ': [' + newExpression + '] ' + comment);
        return [ newExpression ];
    }


    let token = expression[0];
    let expressions = [];
    p('token', token);
    for (let operator of constants.prefixOperators) {


        // Do not generate an expression when the operator is sum and the number is a float
        // Do not generate an expression when the operator is sqrt and the number is negative
        if (typeof token === 'number') {
            if (operator === 'sum' && !Number.isInteger(token)) {
                continue;
            }
            if (operator === 'sqrt' && token < 0) {
                continue;
            }
        }

        // Before the recursive call is made, this code does this:
        // 54 -> (square 54) -- on set for numbers
        // (4 + (44 + 4)) -> (square(4 + (44 + 4)))  -- one set for ()
        let expressionLeftCopy = [...expression];
        let newExpressionLeftCopy = [...newExpression];
        newExpressionLeftCopy.push('(');
        newExpressionLeftCopy.push(operator);
        newExpressionLeftCopy.push(token);
        if (typeof token === 'number') {
            newExpressionLeftCopy.push(')');
        } else {
            let depth = 1;
            for (let i = 1; i < expressionLeftCopy.length; i++) {
                let token2 = expressionLeftCopy[i];
                if (token2 === '(') {
                    depth++;
                    continue;
                }
                if (token2 === ')') {
                    depth--;
                    if (depth === 0) {
                        expressionLeftCopy.splice(i, 0, ')');
                        break;
                    }
                    continue;
                }
            }
        }

        expressionLeftCopy.shift();
        let leftResponse = prefixRecursive(expressionLeftCopy, newExpressionLeftCopy, (stack + 1), 'left');
        expressions = expressions.concat(leftResponse);
    }


    // Invoke the next level of recursion WITHOUT adding the operator
    // to permutate the generated expressions
    let expressionRightCopy = [...expression];
    let newExpressionRightCopy = [...newExpression];
    newExpressionRightCopy.push(token);
    expressionRightCopy.shift();
    let rightResponse = prefixRecursive(expressionRightCopy, newExpressionRightCopy, (stack + 1), 'right');
    expressions = expressions.concat(rightResponse);

    return expressions;
}


module.exports = prefix;
