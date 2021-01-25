'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'postfix';


const d = require('debug')('postfix');
const pc = require('./util').pc(d);
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const xc = require('./util').xc;
const x = require('./util').x;
const xs = require('./util').xs;

const simple = require('./rules').simple;
const adv = require('./rules').advanced;

const parse = require('./expression').parse;

const paren = require('./paren');


var rules;


// Tests
// xc(postfix(adv)(paren(adv)('4+4+4')));

function postfix(r) {
    rules = r;

    return function(expressions) {
        // If there are no postfix operators in the rule set simply
        // return the expressions
        if (!rules.postfixOperators) {
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
            let response = postfixRecursive(expression, [], 1, 'start');
            newExpressions = newExpressions.concat(response);
        }


        // Remove duplicate expressions
        let newExpressionsSet = new Set(newExpressions.map(JSON.stringify));
        let newExpressionsUnique = Array.from(newExpressionsSet).map(JSON.parse);


        return newExpressionsUnique;
    }
}


function postfixRecursive(expression, newExpression, stack, comment) {
    e('postfixRecursive', stack + ': [' + newExpression + '] [' + expression + '] ' + comment);

    if (expression.length === 0) {
        return [ newExpression ];
    }


    // Iterate through the expression until we find a spot where the
    // postfix operation can be applied.  Valid spots:
    // - After )
    // - After a Number
    let tokenCount = 0;
    for (let token of expression) {

        if (rules.infixOperators.includes(token) || (rules.prefixOperators && rules.prefixOperators.includes(token))) {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === '(') {
            tokenCount++;
            newExpression.push(token);
            continue;
        }

        if (token === ')') {
            if (rules.applyToEvaluation) {
                break;
            }
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
        ex('postfixRecursive (mid)', stack + ': [' + newExpression + '] ' + comment);
        return [ newExpression ];
    }


    let token = expression[0];
    let expressions = [];
    for (let operator of rules.postfixOperators) {


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
