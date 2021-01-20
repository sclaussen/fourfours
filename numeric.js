'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'numeric';

const d = require('debug')('numeric');
const p = require('./util').p(d);
const e = require('./util').e(d);
const ex = require('./util').ex(d);

const fmtc = require('./expression').fmtc;
const outc = require('./util').outc;
const pc = require('./util').pc;


// Tests
// outc(generateNumericPermutations([ 4, 44 ]));
// outc(generateNumericPermutations([ 4, 44, 444 ]));
// outc(generateNumericPermutations([ 4, 44, 444, 4444, 4.4, .44, 44.4, 4.44, .444, 444.4, 44.44, 4.444, .4444 ]));


function generateNumericPermutations(numbers) {
    let newExpressions = generateNumericPermutationsRecursively(numbers, [], 0, 1);
    console.log(newExpressions);

    return newExpressions;
}


function generateNumericPermutationsRecursively(numbers, equation, currentFourCount, stack) {
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
        let response = generateNumericPermutationsRecursively(numbers, equationCopy, totalFours, ++stack);

        equations = equations.concat(response);
    }

    return equations;
}


module.exports.generateNumericPermutations = generateNumericPermutations;
