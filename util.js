'use strict';
process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'util';


const d = require('debug')('util');


function e(d) {
    return function(msg, value) {
        if (!d.enabled) {
            return;
        }

        if (value !== undefined) {
            d('Entering: ' + msg + ': ' + JSON.stringify(value));
        } else {
            d('Entering: ' + msg);
        }
    };
}


function ex(d) {
    return function(msg, value) {
        if (!d.enabled) {
            return;
        }

        if (value !== undefined) {
            d('Exiting: ' + msg + ': ' + JSON.stringify(value));
        } else {
            d('Exiting: ' + msg);
        }
    };
}


function p(d) {
    return function(msg, value) {
        if (!d.enabled) {
            return;
        }

        if (value !== undefined) {
            d(msg + ': ' + JSON.stringify(value));
        } else {
            d(msg);
        }
    };
}


function pc(d) {
    return function(msg, collection) {
        if (!d.enabled) {
            return;
        }

        if (collection !== undefined) {
            for (let item of collection){
                d(msg + ': ' + JSON.stringify(collection));
            }
        } else {
            for (let item of msg) {
                d(item);
            }
        }
    };
}


function out(msg, value) {
    if (value !== undefined) {
        console.log(msg + ': ' + JSON.stringify(value));
    } else {
        console.log(msg);
    }
}


function outc(collection) {
    for (let item of collection) {
        console.log(item);
    }
}


module.exports.e = e;
module.exports.ex = ex;
module.exports.p = p;
module.exports.pc = pc;
module.exports.out = out;
module.exports.outc = outc;
