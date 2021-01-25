'use strict';


const adv = require('./rules').advanced;


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


function oc(collection) {
    for (let item of collection) {
        console.log(item);
    }
}


function o(msg, value) {
    if (value !== undefined) {
        console.log(msg + ': ' + JSON.stringify(value));
        return;
    }

    console.log(msg);
}


function errc(collection) {
    for (let item of collection) {
        err(item);
    }
}


function err(msg, value) {
    if (value !== undefined) {
        console.log(msg + ': ' + JSON.stringify(value));
        return;
    }

    console.error(msg);
}


function xc(expressions) {
    for (let expression of expressions) {
        x(expression);
    }
}


function x(expression) {
    console.log(xs(expression));
}


function xs(expression) {
    let expressionString = '';
    for (let token of expression) {

        // Token an infix operation?  If so add spaces pre/post.
        if (adv.infixOperators.includes(token)) {
            expressionString += ' ' + token + ' ';
            continue;
        }

        expressionString += token;
    }

    return expressionString;
}



module.exports.pc = pc;
module.exports.p = p;
module.exports.e = e;
module.exports.ex = ex;

module.exports.oc = oc;
module.exports.o = o;

module.exports.errc = errc;
module.exports.err = err;

module.exports.xc = xc;
module.exports.x = x;
module.exports.xs = xs;
