'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'infix';

const d = require('debug')('infix');
const pc = require('./util').pc(d);
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const xc = require('./util').xc;
const x = require('./util').x;
const xs = require('./util').xs;

const simple = require('./rules').simple;
const adv = require('./rules').advanced;


var rules;


// Tests
// xc(infix([ [ 4, 4, 4, 4 ] ], ruleSet.simple));
// xc(infix([ [ 4, 4, 4, 4 ] ], ruleSet.advanced));


function infix(r) {
    rules = r;

    return function(expressions) {
        let newExpressions = [];
        for (let expression of expressions) {
            let response = infixRecursive(expression, [], 1);
            newExpressions = newExpressions.concat(response);
        }
        return newExpressions;
    }
}


function infixRecursive(expression, newExpression, stack) {
    newExpression.push(expression[0]);
    expression.shift();
    if (expression.length === 0) {
        return [ newExpression ];
    }

    let expressions = [];
    for (let operator of rules.infixOperators) {

        let newExpressionCopy = [...newExpression];
        newExpressionCopy.push(operator);
        let response = infixRecursive([...expression], newExpressionCopy, (stack + 1));

        expressions = expressions.concat(response);
    }

    return expressions;
}


module.exports = infix;
