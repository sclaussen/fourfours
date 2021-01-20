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

var evaluationTotal = 0;
var evaluationInRange = 0;
var start = moment();


fourfours();


function fourfours() {

    let numericExpressions = numeric.generateNumericPermutations(constants.fourVariants)
    for (let numericExpression of numericExpressions) {
        console.error(m() + 'Evaluating ' + numericExpression);

        let infixExpressions = infix.generateInfixPermutations([ numericExpression ]);
        for (let infixExpression of infixExpressions) {
            console.error(m() + 'Evaluating ' + fmt(infixExpression) + ' permutations');

            let parenExpressions = paren.generateParenPermutations([ infixExpression ]);
            for (let parenExpression of parenExpressions) {
                console.error(m() + 'Evaluating ' + fmt(parenExpression) + ' permutations (total ' + evaluationTotal.toLocaleString() + ' / in range ' + evaluationInRange.toLocaleString() + ')');

                let prefixExpressions = prefix.generatePrefixPermutations([ parenExpression ]);
                for (let prefixExpression of prefixExpressions) {
                    let postfixExpressions = postfix.generatePostfixPermutations([ prefixExpression ]);
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
            // - Summation of non-integer
            // - Factorial of number > 10
            // - Factorial of non-integer
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


    // let total = 0;
    for (let answer of Object.keys(answers)) {
        for (let expression of answers[answer]) {
            console.log(zeroPad(answer, 3) + ': ' + fmt(expression));
        }
    }

    // console.log('Expressions (result of >= 0 and <= ' + constants.MAX_GOAL + '): ' + total);
}


function m() {
    return moment().format('h:mm:ssa') + ' ';
}
