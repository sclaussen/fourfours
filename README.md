## Four Fours Problem


From [Wikipedia - Four Fours](https://en.wikipedia.org/wiki/Four_fours):

```
Four fours is a mathematical puzzle. The goal of four fours is to find
the simplest mathematical expression for every whole number from 0 to
some maximum, using only common mathematical symbols and the digit
four (no other digit is allowed).

...

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
solution is found (all other solutions are ignored).

The [generation algorithm](./fourfours.js) works like this:
- **Stage 1**: Numeric permutations are generated (eg 4 4 4 4) [source code](./numeric.js)
  - [Example number permutations](./examples/numeric.txt)
- **Stage 2**: Infix operation permutations are generated (eg 4 + 4 + 4 + 4) [source code](./infix.js)
  - [Example infix operator permutations](./examples/infix.txt) for *, /, +, -, and ^ for four fours: `4 4 4 4`
- **Stage 3**: Parenthesis permutations are generated (eg (((4 + 4) + 4) + 4)) [source code](./paren.js)
  - [Example paren permutations](./examples/paren.txt) for the expression `4 * 4 / 4 + 4`
- **Stage 4**: Prefix operation (aka functions) permutations are generated (eg sqrt(4) + sqrt(4) + sqrt(4) + sqrt(4)) [source code](./prefix.js)
  - [Example function permutations (256)](./examples/prefix.txt) sum, sqrt, square for the expression `(((4 * 4) / 4) + 4)` with applyToEvaluation=F
  - [Example function permutations (16,384)](./examples/prefixT.txt) sum, sqrt, square for the expression `(((4 * 4) / 4) + 4)` with applyToEvaluation=T
- **Stage 5**: Postfix operation (aka factorial) permutations are generated (eg sqrt(4!) + sqrt(4)! + sqrt(4) + sqrt(4!)) [source code](./postfix.js)
  - [Example factorial permutations (16)](./examples/postfix.txt) sum, sqrt, square for the expression `(((4 * 4) / 4) + 4)` with applyToEvaluation=F
  - [Example factorial permutations (128)](./examples/postfixT.txt) for the expression `(((4 * 4) / 4) + 4)` with applyToEvaluation=T
- **Stage 6**: Expression evaluation [source code](./evaluation.js)



## Expression Variability

Given the wikipedia article, here are the capabilities the algorithm
supports to generate expressions.



### Numbers

- Each expression can contain from one to four numbers as long as the
  expression contains precisely four fours.
  - Valid expressions: `4 + 4 + 4 + 4`, `44 + 44`, `444 + 4`, `4444`
  - Invalid expressions: `4 + 4`, `444 + 4444`

- The fours in each number can be concatenated together.
  - Valid numbers: `4`, `44`, `444`, `4444`

- The fours in each number can contain a leading decimal, a trailing
  decimal (resulting in an integer), or a decimal in between the
  digits.
  - Valid numbers (complete set): `4`, `.4`, `44`, `.44`, `4.4`, `444`, `.444`, `4.44`, `44.4`, `4444`, `.4444`, `4.444`, `44.44`, `444.4`
  - Invalid numbers: `40`, `.04`, `.004`, `4.04`



### Parenthesis

- Parenthesis are applied to the combination of the number and the
  infix operators to force evaluation precedence.
  - Valid expressions: `(((4 + 4) + 4) + 4)`, `((44 + 4) * 4)`, `(44 + (4 * 4))`



### Operators

- The operators +, -, *, /, and ^ (power) can be used.
  - Valid expressions: `4 + 4 * 4 / 4`,  `44 - 44`,  `4 * 4 ^ 4 * 4`

- The functions square, square root, and summation (eg sum(4) is 4 + 3
  + 2 + 1) can be applied to any number (eg square(4)) or the result
  of an evaluation (directly prior to a parenthesis) (eg square(4 +
  4)).
  - Valid expressions: `square(4) + square(4) * square(4) / square(4)`,  `square(44 - 44)`,  `square(4) * square(4) ^ square(4 * 4)`

- The factorial operator can be applied to any number (directly after
  the number) or the result of an evaluation (directly after any
  parenthesis).
  - Valid expressions: `((4! + 4)! + 4)! + 4)`,  `44! / 44!`,  `(44! / 44)!`,  `(4 ^ 4 ^ 4 ^ 4)!`



### Valid expressions and limits

Invalid mathematical expressions that are known at generation time to
be invalid are not generated.
- Invalid expression: `4.4! + sum(4.4)` (decimal factorial/sum)

Expressions that result in invalid evaluations at runtime are ignored.
- Invalid expression: `(4 * (4 / (4 - 4)))` (divide by zero)
- Invalid expression: `(((4 - 4) - 4) - 4)!` (negative factorial)

There are arbitrary limits placed on the size of the numbers and
operations to speed up execution:
- No factorial for a number greater than 10 (eg 10!)
- No exponent values less than -10 or greater than 10 (eg 4^10, 4^-10)
- No square of a number less than -100 or greater than 100 (eg square(100), square(-100))
- No summation for a number less than -100 or greater than 100 (eg sum(100), sum(-100))

Note: Summations are only applied to integers.
Note: Factorials are only applied to positive integers.
Note: Square roots are only applied to zero and positive numbers.



### Rule Sets

In order to enable different combinations of rules to be applied the
algorithm supports the concept of [rule sets (source)](./rules.js].
The rule sets enable a definition for which numbers and operators
should be applied to generate the possible set of expressions.

Generating all the expression permutations for functions and factorial
results in an explosion of possible expressions.  To provide a relief
from the potential explosion, there is a rule named applyToEvaluation
that determines how functions and the factorial operation are applied.

When applyToEvaluation is set to false, functions and factorial are
only applied directly to a number.  When true, they are applied to the
number, as well as the result of a prior evaluation.

For example:

- Expression: `(((4 + 4) + 4) + 4)`
- Possible factorial locations (applyToEvaluation=false): `(((4! + 4!) + 4!) + 4!)`
- Possible factorial locations (applyToEvaluation=true): `(((4! + 4!)! + 4!)! + 4!)!`
- Possible function locations (applyToEvaluation=false): `(((square(4) + square(4)) + square(4)) + square(4))`
- Possible function locations (applyToEvaluation=true): `square(square(square(square(4) + square(4)) + square(4)) + square(4))`

Unless indicated otherwise, apply to evaluation is set to false in the
rule sets.

Here's a summary of each rule set including the total generated
expressions, how many result in an integer solution between 0 and
1000, and a description of the numbers and operations they support.

```
                 Expression    Solutions
Rule Set       Permutations       0-1000  Description
--------       ------------    ---------  -----------
simple                  320          227  4 * / + -
power                   625          352  4 * / + - ^
concat                  791          425  4 44 444 4444 * / + - ^
decimal              11,930        1,846  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^
factorial            56,261        7,861  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ !
functions         1,575,551      109,735  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ sum sqrt square
grande            2,560,000      265,649  4 * / + - ^ ! sum sqrt square

factorialT          427,066       13,982  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ ! (applyToEvaluation=T)
functionsT       97,221,656    2,847,765  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ sum sqrt square (applyToEvaluation=T)
advancedT  ~300,000,000,000      Unknown  4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ ! sum sqrt square (applyToEvaluation=T)
```

I interrupted the advanced rule set execution because:

- For each number/infix/parenthesis combination the algorithm took 70
  minutes to process around 100 million expression permutations.

- There were a total of 3031 number/infix/parenthesis combinations,
  thus, via extrapolation it would have taken nearly 150 days of
  compute time to generate and process nearly 300 billion expressions.



# Execution Results

Here are some of the output files for each rule set.  Here's what each
link means:
- **Solutions: 10 shortest + 10 longest*8: The 10 shortest and the 10
  longest solutions for each solution between 0 and 1000.  Note that if
  the number of solutions is <= 20 the combination of the 10 shortest
  and 10 longest will contain duplicates.

- **Solution count**: For each solution 0 to 1000, the total number of
  solutions found.

- **Solution count sorted**: The count of solutions found from 0 to 1000
  but sorted and the numbers for which solutions were not found have
  been removed.

- **Solutions**: The raw data of 1001 files, one per each possible
  solution 0 to 1000, each containing all the solutions found for that
  number.



## simple (4 * / + -)

- [Solutions: 10 shortest + 10 longest](./data/simple-solutions-10.txt)
- [Solution count](./data/simple-count.txt)
- [Solution count sorted](./data/simple-count-sorted.txt)
- [Solutions](./data/simple2/)


## power (4 * / + - ^)

- [Solutions: 10 shortest + 10 longest](./data/power-solutions-10.txt)
- [Solution count](./data/power-count.txt)
- [Solution count sorted](./data/power-count-sorted.txt)
- [Solutions](./data/power2/)


## concat (4 44 444 4444 * / + - ^)

- [Solutions: 10 shortest + 10 longest](./data/concat-solutions-10.txt)
- [Solution count](./data/concat-count.txt)
- [Solution count sorted](./data/concat-count-sorted.txt)
- [Solutions](./data/concat2/)


## decimal (4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^)

- [Solutions: 10 shortest + 10 longest](./data/decimal-solutions-10.txt)
- [Solution count](./data/decimal-count.txt)
- [Solution count sorted](./data/decimal-count-sorted.txt)
- [Solutions](./data/decimal2/)


## factorial (4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ !)

- [Solutions: 10 shortest + 10 longest](./data/factorial-solutions-10.txt)
- [Solution count](./data/factorial-count.txt)
- [Solution count sorted](./data/factorial-count-sorted.txt)
- [Solutions](./data/factorial2/)


## functions (4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ sum sqrt square)

- [Solutions: 10 shortest + 10 longest](./data/functions-solutions-10.txt)
- [Solution count](./data/functions-count.txt)
- [Solution count sorted](./data/functions-count-sorted.txt)
- [Solutions](./data/functions2/)


## grande (4 * / + - ^ ! sum sqrt square)

- [Solutions: 10 shortest + 10 longest](./data/grande-solutions-10.txt)
- [Solution count](./data/grande-count.txt)
- [Solution count sorted](./data/grande-count-sorted.txt)
- [Solutions](./data/grande2/)


## factorialT (4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ ! (applyToEvaluation=T))

- [Solutions: 10 shortest + 10 longest](./data/factorialT-solutions-10.txt)
- [Solution count](./data/factorialT-count.txt)
- [Solution count sorted](./data/factorialT-count-sorted.txt)
- [Solutions](./data/factorialT2/)


## functionsT (4 44 444 4444 4.4 4.44 44.4 4.444 44.44 444.4 * / + - ^ sum sqrt square (applyToEvaluation=T))

- [Solutions: 10 shortest + 10 longest](./data/functionsT-solutions-10.txt)
- [Solution count](./data/functionsT-count.txt)
- [Solution count sorted](./data/functionsT-count-sorted.txt)
- [Solutions](./data/functionsT2/)
