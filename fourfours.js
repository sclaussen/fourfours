'use strict'
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'fourfours';

const moment = require('moment');
const d = require('debug')('fourfours');
const p = require('./util').p(d);
const pc = require('./util').pc(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const constants = require('./constants');
const numeric = require('./numeric');
const infix = require('./infix');
const prefix = require('./prefix');
const postfix = require('./postfix');
const paren = require('./paren');
const evaluate = require('./evaluate');
const fmt = require('./expression').fmt;
const fmtc = require('./expression').fmtc;

const zeroPad = (num, places) => String(num).padStart(places, '0')
const spacePad = (num, places) => String(num).padStart(places, ' ')

var evaluationTotal = 0;
var evaluationInRange = 0;
var start = moment();


fourfours();


function fourfours() {

    // 4 4 4 4
    let numericExpressions = numeric(constants.numericVariants)
    for (let numericExpression of numericExpressions) {
        msg(numericExpression, false);

        // 4 * 4 + 4 - 4
        let infixExpressions = infix([ numericExpression ]);
        for (let infixExpression of infixExpressions) {
            msg(infixExpression);

            // (((4 + 4) + 4) + 4)
            let parenExpressions = paren([ infixExpression ]);
            for (let parenExpression of parenExpressions) {
                msg(parenExpression);

                // (sum(sqrt(square(sum(4) + sqrt(4)) + sqaure(4)) + sum(4)))
                let prefixExpressions = prefix([ parenExpression ]);
                for (let prefixExpression of prefixExpressions) {
                    msg(prefixExpression);

                    // (sum(sum(sum(sum(4!)! + sum(4!)!)! + sum(4!)!)! + sum(4!)!)!)!
                    let postfixExpressions = postfix([ prefixExpression ]);
                    evaluateExpressions(postfixExpressions);
                }
            }
        }
    }
}


function evaluateExpressions(expressions) {

    // console.log('Total expressions: ' + expressions.length);
    let answers = {};
    for (let expression of expressions) {

        let answer;
        try {
            evaluationTotal++;
            answer = evaluate(expression);
        } catch (e) {
            // Purposefully ignore
            // - Divide by zero
            // - Exponent too large
            // - Summation of non-integer, too large, too small
            // - Square root of negative
            // - Factorial of non-integer, negative, too large
            // - Base squared too small, too large
        }

        if (Number.isInteger(answer) && answer >= 0 && answer <= constants.MAX_GOAL) {
            evaluationInRange++;
            if (!answers[answer]) {
                answers[answer] = [];
            }
            answers[answer].push(expression);
        }
    }


    // Remove duplicates
    for (let answer of Object.keys(answers)) {
        let set = new Set(answers[answer].map(JSON.stringify));
        let unique = Array.from(set).map(JSON.parse);
        answers[answer] = unique;
    }


    // For now, allow the sorting to be done via command line for efficiency
    //
    // let total = 0;
    // for (let answer of Object.keys(answers).sort((n1, n2) => parseInt(n1) < parseInt(n2))) {
    //     for (let expression of answers[answer]) {
    //         console.log(zeroPad(answer, 3) + ': ' + fmt(expression));
    //         total++;
    //     }
    // }


    for (let answer of Object.keys(answers)) {
        for (let expression of answers[answer]) {
            console.log(zeroPad(answer, 3) + ': ' + fmt(expression));
        }
    }
}


function msg(s, format) {
    if (format === undefined) {
        console.error(moment().format('h:mm:ssa') + '  ' + spacePad(evaluationTotal.toLocaleString(), 11) + '  ' + spacePad(evaluationInRange.toLocaleString(), 9) + '  Evaluating permutations of: ' + fmt(s));
    } else {
        console.error(moment().format('h:mm:ssa') + '  ' + spacePad(evaluationTotal.toLocaleString(), 11) + '  ' + spacePad(evaluationInRange.toLocaleString(), 9) + '  Evaluating permutations of: ' + s);
    }
}
