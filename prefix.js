'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'prefix';

const d = require('debug')('prefix');
const pc = require('./util').pc(d);
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const xc = require('./util').xc;
const x = require('./util').x;
const xs = require('./util').xs;

const simple = require('./rules').simple;
const adv = require('./rules').advanced;
const max = require('./rules').maximum;

const parse = require('./expression').parse;

const paren = require('./paren');
const postfix = require('./postfix');


var rules;


// Tests
// xc(postfix(adv)(prefix(adv)(paren(adv)('4 + 4 + 4 + 4'))));
// for (let exp of prefix(max)(paren(max)('4 + 4 + 4 + 4'))) {
//     // console.error(xs(exp));
//     xc(postfix(max)([ exp ]));
// }
// xc(postfix(adv)(prefix(adv)(paren(adv)('4 + 4 + 4 + 4'))));
// xc(prefix(adv)('(((4 + 4) + 4) + 4)'));
// xc(postfix(prefix('(((4 + 4) + 4) + 4)')));
// for (let exp of prefix('(((4 + 4) + 4) + 4)')) {
//     console.error(xs(exp));
//     xc(postfix([ exp ]));
// }
// xc(prefix('4'));
// xc(prefix('((4 + 4) + 4)'));
// xc(prefix('(((4 + 4) + 4) + 4)', false));
// xc(postfix(prefix(paren('4 + 4 + 4 + 4'), true)));
// xc(postfix(prefix(paren('4 + 4 + 4 + 4'))));


function prefix(r) {
    rules = r;

    return function(expressions) {
        // If there are no prefix operators in the rule set simply
        // return the expressions
        if (!rules.prefixOperators) {
            return expressions;
        }

        // If there are no expressions or the array length is 0,
        // return the expressions
        if (!expressions || (typeof expressions === 'object' && expressions.length === 0)) {
            return expressions;
        }

        // To enable easy testing, support a string of a single
        // expressions (aka '4 + 4'), and in that case, parse it into
        // the expression array that the algorithm requires
        if (typeof expressions === 'string') {
            expressions = [ parse(expressions) ];
        }


        // Logic
        let newExpressions = [];
        for (let expression of expressions) {
            let response = prefixRecursive(expression, [], 1, 'start');
            newExpressions = newExpressions.concat(response);
        }


        // Remove duplicate expressions
        let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
        let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);


        return newExpressionsUnique;
    }
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
        if (rules.infixOperators.includes(token)) {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === '(') {
            if (rules.applyToEvaluation) {
                break;
            }
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === ')') {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (typeof token === 'number') {
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
    let isNumber = typeof token === 'number';
    let expressions = [];
    for (let operator of rules.prefixOperators) {


        // Do not generate an expression when the operator is sum and the number is a float
        // Do not generate an expression when the operator is sqrt and the number is negative
        if (isNumber) {
            if (operator === 'sum' && !Number.isInteger(token)) {
                continue;
            }
            if (operator === 'sqrt' && token < 0) {
                continue;
            }
        }

        // Before the recursive call is made, this code does this:
        // 54 -> square(54) -- on set for numbers
        // (4 + (44 + 4)) -> square(4 + (44 + 4))  -- one set for ()
        let expressionLeftCopy = [...expression];
        let newExpressionLeftCopy = [...newExpression];
        // newExpressionLeftCopy.push('(');
        newExpressionLeftCopy.push(operator);
        if (isNumber) {
            newExpressionLeftCopy.push('(');
        }
        newExpressionLeftCopy.push(token);
        if (isNumber) {
            newExpressionLeftCopy.push(')');
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
