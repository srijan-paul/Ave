# TODO LIST

[x] Write a Lexer with proper indntation sensitivity

[x] Write some tests

**Lexer**

[x] Lexer should return an object that stores tokens as well as comments

[x] Write Lexer specific tests

[x] Test the Lexer

[x] Add support for both single and double quote strings

[ ] Add better error messages

[x] Handle the spaces at the end of file better

[x] Implement indentation sensitivity for fat arrow functions as arguments

[x] Support escape sequences in strings

[x] Add && , is, === and || tokens support

[x] Fix the indendtation level bug when two statements are multiple lines apart

**Feature Implementation**

[x] Implement `in` expressions

[x] Implement `for` expressions

[x] Make the indentation length flexible and user dependent(?)

[x] Better pattern matching in switch case

[x] Add template strings

[ ] Add embedded JS

[ ] Create a separate dev branch for implementing static typing

[ ] Lex Regexes

**Parser**

[x] Begin work on the parser

[x] Go through TDOP once more (I've decided to use recursive descent instead of Pratt)

[x] Parse arrays

[x] Parse Call expressions

[ ] Parse Class declarations

[x] Parse switch statements

[ ] Implement scope module <!-- useful for when I add static type checking -->

[x] Start parsing statements and declarations

[ ] Add better error messages

[ ] Merge preunaryexpr and post unary expr into a single node type and change the compiler accordingly

<!-- [ ] Come up with a way to add operator overloading (There won't be any) -->

[ ] Write several more tests for the parser

[ ] Add the spread operator and support it's parsing

[x] Implement enum parsing

[x] Parse when expressions after for expressions

[ ] Parse the spread syntax

[x] Parse `to` \ `with` syntax

[x] Parse object literals

[NO] _Allow keyword overwriting (?)_

[x] Object property names can be numbers, strings or identifiers

[NO] Indents before values should only be allowed in assignment expressions

[ ] return stmts not allowed in single line lambdas

[x] Dot expressions should be left recursive.

[ ] Parse destructuring

[ ] Async functions

[ ] parse downto expression

**Compiler**

[x] Compile for/in/when expressions

**Other**

[ ] Create an error handling module

[x] Start writing documentation

[ ] Setup the cli commands

[ ] Setup a JS code formatter

[ ] Update readme

[ ] copy over the docs from stack edit
