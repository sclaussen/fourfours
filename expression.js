'use strict'
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'expression';


const d = require('debug')('expression');
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');


// Converts an expression string into an array of tokens that comprise
// the expression.
function parse(expressionString) {
    let expression = [];

    for (let i = 0; i < expressionString.length; i++) {
        let ch = expressionString[i];


        // Next token part of a integer or float?
        if (isDigit(ch) || ch === '.') {
            let numberToken = ch;
            for (i = i + 1; i < expressionString.length; i++) {
                ch = expressionString[i];
                if (isDigit(ch) || ch === '.') {
                    numberToken += ch;
                    continue;
                }
                break;
            }
            expression.push(parseFloat(numberToken));
            i--;
            continue;
        }


        // Next token a function name?
        let functionFound = false;
        let expressionStringRemaining = expressionString.slice(i);
        for (let functionName of constants.prefixOperators) {
            if (expressionStringRemaining.startsWith(functionName)) {
                expression.push(functionName);
                i += functionName.length;
                functionName = true;
                break;
            }
        }
        if (functionFound) {
            continue;
        }


        // Handle all single character tokens
        if (constants.infixOperators.includes(ch) || constants.postfixOperators.includes(ch)) {
            expression.push(ch);
            continue;
        }

        switch (ch) {
        case ' ':
            // Just skip whitespace
            continue;
        case '(':
        case ')':
            expression.push(ch);
            continue;
        }
    }

    return expression;
}


function fmt(expression) {
    let expressionString = '';

    for (let token of expression) {

        // Token a function name?
        if (constants.prefixOperators.includes(token)) {
            expressionString += token + ' ';
            continue;
        }

        // Token an infix operation?
        if (constants.infixOperators.includes(token)) {
            expressionString += ' ' + token + ' ';
            continue;
        }

        // (, ), number, !
        expressionString += token;
    }

    return expressionString;
}


function fmtc(expressions) {
    for (let expression of expressions) {
        console.log(fmt(expression));
    }
}


function isDigit(ch) {
    switch (ch) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
        return true;
    }
    return false;
}


module.exports.parse = parse;
module.exports.fmt = fmt;
module.exports.fmtc = fmtc;
