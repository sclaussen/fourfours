'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'numeric';

const d = require('debug')('numeric');
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
// pc(numeric(ruleSet.simple));
// pc(numeric(ruleSet.advanced));


function numeric(r) {
    rules = r;

    return function() {
        let newExpressions = numericRecursive(rules.numbers, [], 0, 1);
        return newExpressions;
    }
}


function numericRecursive(numbers, equation, currentFourCount, stack) {
    if (parseInt(currentFourCount) == 4) {
        return [ equation ];
    }

    let equations = [];
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];

        // If we added this number to the equation, would we exceed 4
        // fours in the equation?  If so, skip this number.
        let s = number.toString();
        let newFours = s.split('4').length - 1;
        let totalFours = currentFourCount + newFours;
        if (totalFours > 4) {
            continue;
        }

        // The new number can be added to the equation: copy the
        // equation, add the number to the new equation, and
        // recursively continue on
        let equationCopy = [...equation];
        equationCopy.push(number);
        let response = numericRecursive(numbers, equationCopy, totalFours, (stack + 1));

        equations = equations.concat(response);
    }

    return equations;
}


module.exports = numeric;
