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
expression results in a number between 0 and 1000 then a solution is
found.  As a result of the permutation generator, billions of
expressions are generated and evaluated.

The generation algorithm works like this:
- Stage 1: Numberic permutations are generated (eg 4 4 4 4)
- Stage 2: Infix operation permutations are generated (eg 4 + 4 + 4 + 4)
- Stage 3: Parenthesis permutations are generated (eg (((4 + 4) + 4) + 4))
- Stage 4: Prefix operation permutations are generated (eg (sqrt 4) + (sqrt 4) + (sqrt 4) + (sqrt 4))
- Stage 5: Postfix operation permutations are generated (eg ((((sqrt 4!)! + (sqrt 4!)!)! + (sqrt 4!)!)! + (sqrt 4!)!)!)
- Stage 6: Expression evaluation



## Rules

Given the wikipedia article, here are the rules I used:

- Numbers:
  - All numbers in the expression must contain one or more 4s and no
    other digits
  - Each number can comprised of one to four digits concatenated
    together.
    - Valid numbers: `4`, `44`, `444`, `4444`
  - Precisely four 4s must be used in the expression.
    - Valid expressions: `4 + 4 + 4 + 4`, `44 + 44`, `444 + 4`, `4444`
    - Invalid expressions `4 + 4`, `444 + 4444`
  - Each number can contain a leading decimal, a trailing decimal, or a
    decimal in between the digits.
    - Valid numbers: `4`, `.4`, `.44`, `.444`, `.4444`, `4.4`, `4.44`, `4.444`, `444.4`
    - Invalid numbers: `40`, `.04`, `.004`, `4.04`

- Parenthesis:
  - Parenthesis can be applied to the combination of the number and the
    infix operators to force evaluation precedence.
    - Valid expressions: `((44 + 4) * 4)`, `(44 + (4 * 4))`

- Operations:
  - The operators +, -, *, /, and ^ (power) can be used.
    - Valid expressions: `4 + 4 * 4 / 4`,  `44 - 44`,  `4 * 4 ^ 4 * 4`
  - Factorial can be applied to any number or the result of an
    evaluation (directly after a parenthesis).
    - Valid expressions: `((4! + 4)! + 4)! + 4)`,  `44! / 44!`,  `(4 ^ 4 ^ 4 ^ 4)!`
  - The functions square, square root, and summation can be applied to
    any number or the result of an evaluation (directly prior to a
    parenthesis).
    - Valid expressions: `square ((4! + 4)! + 4)! + 4)`,  `sqrt 44! / sum 44!`,  `(4 ^ 4 ^ 4 ^ 4)!`



### Evalution limits

The following somewhat arbitrary thresholds are enforced resulting in
an invalid expression due to the sheer volume of compute time
required to evaluate billions of expressions:

- No factorial for a number greater than 8 (eg 8!)
- No power for a number greater than 8 or less than -8 (eg 4^8, 4^-8)
- No square of a number greater than 100 or less than -100 (eg square 100, square -100)
- No summation for a number greater than 100 or less than -100  (sum 100, sum -100)

Note: Summations are only applied to integers.
Note: Factorials are only applied to positive integers.
Note: Square roots are only applied to zero and positive numbers.
