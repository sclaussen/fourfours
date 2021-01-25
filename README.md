## Four Fours Problem


From [Wikipedia - Four Fours](https://en.wikipedia.org/wiki/Four_fours):

```
There are many variations of four fours; their primary difference
is which mathematical symbols are allowed.

Essentially all variations at least allow addition ("+"),
subtraction ("−"), multiplication ("×"), division ("÷"), and
parentheses, as well as concatenation (e.g., "44" is allowed).

Most also allow the factorial ("!"), exponentiation (e.g. "444"),
the decimal point (".") and the square root ("√") operation.

Other operations allowed by some variations include the reciprocal
function ("1/x"), subfactorial ("!" before the number: !4 equals
9), overline (an infinitely repeated digit), an arbitrary root, the
square function ("sqr"), the cube function ("cube"), the cube root,
the gamma function (Γ(), where Γ(x) = (x − 1)!), and percent
("%").
```



## Algorithm

This algorithm generates permutations of the four fours expressions
and then evaluates the expressions.  If the evaluation of an
expression results in an integer between 0 and 1000 inclusively then a
solution is found (all other numbers are ignored).

The generation algorithm works like this:
- Stage 1: Numeric permutations are generated (eg 4 4 4 4)
- Stage 2: Infix operation permutations are generated (eg 4 + 4 + 4 + 4)
- Stage 3: Parenthesis permutations are generated (eg (((4 + 4) + 4) + 4))
- Stage 4: Prefix operation permutations are generated (eg sqrt(4) + sqrt(4) + sqrt(4) + sqrt(4))
- Stage 5: Postfix operation permutations are generated (eg sqrt(4!) + sqrt(4)! + sqrt(4) + sqrt(4!))
- Stage 6: Expression evaluation



## Rules

Given the wikipedia article, here are the rules the algorithm
uses to generate expressions:

- Numbers:
  - All numbers in the expression must contain one or more 4s and no
    other digits
  - Each number in the expression can comprised of one to four digits
    concatenated together.
    - Valid numbers: `4`, `44`, `444`, `4444`
  - Precisely four 4s must be used in the expression.
    - Valid expressions: `4 + 4 + 4 + 4`, `44 + 44`, `444 + 4`, `4444`
    - Invalid expressions: `4 + 4`, `444 + 4444`
  - Each number in the expression can contain a leading decimal, a
    trailing decimal (aka an integer), or a decimal in between the
    digits.
    - Valid numbers: `4`, `.4`, `44`, `.44`, `4.4`, `444`, `.444`, `4.44`, `44.4`, `4444`, `.4444`, `4.444`, `44.44`, `444.4`
    - Invalid numbers: `40`, `.04`, `.004`, `4.04`

- Parenthesis:
  - Parenthesis are applied to the combination of the number and the
    infix operators to force evaluation precedence.
    - Valid expressions: `(((4 + 4) + 4) + 4)`, `((44 + 4) * 4)`, `(44 + (4 * 4))`

- Operations:
  - The operators +, -, *, /, and ^ (power) can be used.
    - Valid expressions: `4 + 4 * 4 / 4`,  `44 - 44`,  `4 * 4 ^ 4 * 4`
  - Factorial can be applied to any number or the result of an
    evaluation (directly after a parenthesis).
    - Valid expressions: `((4! + 4)! + 4)! + 4)`,  `44! / 44!`,  `(4 ^ 4 ^ 4 ^ 4)!`
  - The functions square, square root, and summation can be applied to
    any number or the result of an evaluation (directly prior to a
    parenthesis).
    - Valid expressions: `(square((4! + 4)! + 4)! + 4))`,  `(sqrt(44)! / sum(44)!)!`,  `(4 ^ sqrt(4)!) ^ (4 ^ 4)!`



### Evalution limits

The following thresholds are enforced resulting in an invalid
expression due to the sheer volume of compute time required to
evaluate the expressions:

- No factorial for a number greater than 10 (eg 10!)
- No exponents for less than -10 or greater than 10 (eg 4^10, 4^-10)
- No square of a number less than -100 or greater than 100 (eg square(100), square(-100))
- No summation for a number less than -100 or greater than 100 (eg sum(100), sum(-100))

Note: Summations are only applied to integers.
Note: Factorials are only applied to positive integers.
Note: Square roots are only applied to zero and positive numbers.



# Execution

The algorithm supports a set of rule profiles to support different
four fours rule sets that demonstrate the difference in the number of
expression permutations that are generated, and as a result, the valid
solutions between 0 and 1000 that are found.  The rules enable
variations in the numbers, operations, functions, and factorial.

Here's a summary of the rule sets (see rules.js):

- **simple**: four numbers containing the single digit 4, operators *, /, +, -, and parenthesis
- **power**: simple rule set, adds the ^ operator
- **concat**: power rule set, adds the numbers 44, 444, and 4444
- **decimal**: concat rule set, adds the numbers
- **factorial**: decimal rule set, adds factorial
- **functions**: decimal rule set, adds the summation, square, and square root functions
- **advanced**: decimal rule set, adds factorial and the functions


# Results

## Expression Permutations and Solutions

Here's a summary for each rule set.  The expression permutations are
the totally number of expressions that are generated and the solutions
represent those expressions whose evaluation resulted in an integer
between 0 and 1000.

NOTE: The advanced scenario didn't complete due to its size and
computer time.  The expression permutations would have resulted in
somewhere between 200 to 300 billion and taken approximately 150 days
On my laptop to complete.

```
                Expression    Solutions  Description
              Permutations       0-1000
simple                 320          227  4 * / + -
power                  625          352  4 * / + - ^
concat                 791          425  4 44 444 4444 * / + - ^
decimal             11,930        1,846  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^
factorial          427,066       13,982  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ !
functions       97,221,656    2,847,765  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ sum sqrt square
advanced  ~300,000,000,000      Unknown  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ ! sum sqrt square
```

Here are some of the output files for each rule set.

## simple

- (Solutions: 10 shortest + 10 longest)[data/simple-solutions-10.txt]
- (Solution count)[data/simple-count.txt]
- (Solution count sorted)[data/simple-count-sorted.txt]
- (Solutions)[data/simple/]


## power

- (Solutions: 10 shortest + 10 longest)[data/power-solutions-10.txt]
- (Solution count)[data/power-count.txt]
- (Solution count sorted)[data/power-count-sorted.txt]
- (Solutions)[data/power/]


## concat

- (Solutions: 10 shortest + 10 longest)[data/concat-solutions-10.txt]
- (Solution count)[data/concat-count.txt]
- (Solution count sorted)[data/concat-count-sorted.txt]
- (Solutions)[data/concat/]


## decimal

- (Solutions: 10 shortest + 10 longest)[data/decimal-solutions-10.txt]
- (Solution count)[data/decimal-count.txt]
- (Solution count sorted)[data/decimal-count-sorted.txt]
- (Solutions)[data/decimal/]


## factorial

- (Solutions: 10 shortest + 10 longest)[data/factorial-solutions-10.txt]
- (Solution count)[data/factorial-count.txt]
- (Solution count sorted)[data/factorial-count-sorted.txt]
- (Solutions)[data/factorial/]


## functions

- (Solutions: 10 shortest + 10 longest)[data/functions-solutions-10.txt]
- (Solution count)[data/functions-count.txt]
- (Solution count sorted)[data/functions-count-sorted.txt]
- (Solutions)[data/functions/]
