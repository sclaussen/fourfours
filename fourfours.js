'use strict'
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'fourfours';

const fs = require('fs')
const moment = require('moment');

const d = require('debug')('fourfours');
const pc = require('./util').pc(d);
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const xc = require('./util').xc;
const x = require('./util').x;
const xs = require('./util').xs;

const oc = require('./util').oc;
const o = require('./util').o;

const ruleSet = require('./rules');

var evaluate;
var numeric;
var infix;
var prefix;
var postfix;
var paren;

const zeroPad = (num, places) => String(num).padStart(places, '0')
const spacePad = (num, places) => String(num).padStart(places, ' ')


var evaluationTotal = 0;
var evaluationInRange = 0;
var start = moment();


fourfours(process.argv);


function fourfours(args) {

    // Rules
    let rules = ruleSet.simple;
    if (args.length > 2) {
        rules = ruleSet[args[2]];
    }
    requireModules(rules);


    // 4 4 4 4
    let numericExpressions = numeric();
    for (let numericExpression of numericExpressions) {
        msg(numericExpression, false);


        // 4 * 4 + 4 - 4
        let infixExpressions = infix([ numericExpression ]);
        for (let infixExpression of infixExpressions) {
            // msg(infixExpression);


            // (((4 + 4) + 4) + 4)
            let parenExpressions = paren([ infixExpression ]);
            for (let parenExpression of parenExpressions) {
                // msg(parenExpression);


                // (sum(sqrt(square(sum(4) + sqrt(4)) + sqaure(4)) + sum(4)))
                let prefixExpressions = prefix([ parenExpression ]);
                for (let prefixExpression of prefixExpressions) {
                    // msg(prefixExpression);


                    // (sum(sum(sum(sum(4!)! + sum(4!)!)! + sum(4!)!)! + sum(4!)!)!)!
                    let postfixExpressions = postfix([ prefixExpression ]);
                    evaluateExpressions(postfixExpressions, rules);
                }
            }
        }
    }

    msg('Finished!');
    let file = 'data/Summary.txt';
    fs.writeFileSync(file, rules.name + ': Permutations: ' + spacePad(evaluationTotal.toLocaleString(), 11) + '  Solutions: ' + spacePad(evaluationInRange.toLocaleString(), 9) + '\n', { flag: 'a+' });
}


function evaluateExpressions(expressions, rules) {

    let answers = {};
    for (let expression of expressions) {

        let answer;
        try {
            evaluationTotal++;
            answer = require('./evaluate')(rules)(expression);
        } catch (e) {
            // Purposefully ignore
            // - Divide by zero
            // - Exponent too large
            // - Summation of non-integer, too large, too small
            // - Square root of negative
            // - Factorial of non-integer, negative, too large
            // - Base squared too small, too large
        }

        if (Number.isInteger(answer) && answer >= 0 && answer <= rules.maxGoal) {
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


    let file = "data/" + rules.name + '-solutions.txt';
    for (let answer of Object.keys(answers)) {
        for (let expression of answers[answer]) {
            fs.writeFileSync(file, zeroPad(answer, 3) + ': ' + xs(expression) + '\n', { flag: 'a+' });
        }
    }
}


function requireModules(rules) {
    evaluate = require('./evaluate')(rules);

    numeric = require('./numeric')(rules);
    paren = require('./paren')(rules);
    infix = require('./infix')(rules);
    prefix = require('./prefix')(rules);
    postfix = require('./postfix')(rules);
}


function msg(s, format) {
    if (format === undefined) {
        console.error(moment().format('h:mm:ssa') + '  ' + spacePad(evaluationTotal.toLocaleString(), 11) + '  ' + spacePad(evaluationInRange.toLocaleString(), 9) + '  Evaluating permutations of: ' + xs(s));
    } else {
        console.error(moment().format('h:mm:ssa') + '  ' + spacePad(evaluationTotal.toLocaleString(), 11) + '  ' + spacePad(evaluationInRange.toLocaleString(), 9) + '  Evaluating permutations of: ' + s);
    }
}
