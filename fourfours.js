'use strict'
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'fourfours';

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

const moment = require('moment');

const zeroPad = (num, places) => String(num).padStart(places, '0')

// Source: https://en.wikipedia.org/wiki/Four_fours
//
// There are many variations of four fours; their primary difference
// is which mathematical symbols are allowed.
//
// Essentially all variations at least allow addition ("+"),
// subtraction ("−"), multiplication ("×"), division ("÷"), and
// parentheses, as well as concatenation (e.g., "44" is allowed).
//
// Most also allow the factorial ("!"), exponentiation (e.g. "444"),
// the decimal point (".") and the square root ("√") operation.
//
// Other operations allowed by some variations include the reciprocal
// function ("1/x"), subfactorial ("!" before the number: !4 equals
// 9), overline (an infinitely repeated digit), an arbitrary root, the
// square function ("sqr"), the cube function ("cube"), the cube root,
// the gamma function (Γ(), where Γ(x) = (x − 1)!), and percent
// ("%"). Thus
//
// Given the above, here are the rules I used:
//
// Any combination of four 4s can be used in an equation.  The 4s can
// be concatenated together (eg 44, 444, 4444).  Each number can have
// a decimal directly preceeding the first 4 (eg .4, .44, .444,
// .4444), directly trailing the last 4 (eg 4, 44, 444, 4444), or at
// any point between the digits comprising the number (eg .4, 4.4,
// 4.44, 44.4, ...).  The numbers can be combined with the operators
// +, -, *, /, and ^ (power).  Parenthesis can be applied to the
// combination of the number and the numeric operations to force
// evaluation precedence.  Factorial can be applied to any number or
// the result of an evaluation.  The functions square, square root,
// and summation can be applied to any number or the result of an
// evaluation.
//
// Concretely:
//
// Numeric permutations (number 4, 4 concatenated with other 4s, and
// decimal variants):
// - 4, 44, 444, 4444, .4, 4.4, .44, 44.4, 4.44, .444, 444.4, 44.44, 4.444, .4444
// - eg [4 * 4 * 4 * 4], [4 + 44 + 4], [4.4 + .4 + 4]
//
// Parenthesis to force evaluation order:
// - eg [44 + 4 * 4] becomes [((44 + 4) * 4)] and [(44 + (4 * 4))],
//
// Infix operators
// - '*', '/', '+', '-', '^'
// Note: ^ isn't truly infix, but in this scenario is similar to the
// other infix operations in terms of variances/combos/permutations
// - 4^4 is 4 to the fourth power, [(4 ^ ((4 + 4) + 4))] is 4 to the 12th power
// - eg [4 * 4 / 4 + 4], [4 + 4 - 4 / 4], [44 / 4 ^ 4]
//
// Postfix operator: !
// Note 1: anything greater than 10! I've arbitrarily considered an
// error due to numeric size
// Note 2: Factorial only applies to integers numbers and evaluation
// results
// - eg [4! * 4 / 4 + 4], [4 + 4 - 4 / 4!], [4444!]
//
// Prefix operators (functions):
// - sqrt, square, sum
// Note: Summation only applies to integers numbers and evaluation
// results
// - eg sqrt 4 is 2, square 4 is 16, sum of 4 is 4 + 3 + 2 + 1 or 10
// - eg [square 4 * 4 / 4 + 4], [sqrt 4 + 4 - 4 / 4!], [sum 4444]
//
// When there's a question of precedence, the expression is evaluated
// as follows:
// factorial, functions (square, square root, summartion), ^, *, /, +, -
const MAX = 1000;

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

        if (Number.isInteger(answer) && answer >= 0 && answer <= MAX) {
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

    // console.log('Expressions (result of >= 0 and <= ' + MAX + '): ' + total);
}


function m() {
    return moment().format('h:mm:ssa') + ' ';
}
