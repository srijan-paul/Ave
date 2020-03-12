# TODO LIST

[x] Write a Lexer with proper indntation sensitivity

[x] Write some tests

**Lexer**

[x] Lexer should return an object that stores tokens as well as comments

[ ] Write Lexer specific tests

[x] Test the Lexer

[x] Add support for both single and double quote strings

[ ] Add better error messages

[x] Handle the spaces at the end of file better

[ ] Implement indentation sensitivity for fat arrow functions as arguments

[ ] Support escape sequences in strings

[ ] Add && , is, === and || tokens support

**Feature Implementation**

[x] Implement 'in' expressions

[x] Implement 'for' expressions

[ ] Make the indentation length flexible and user dependent(?)

[x] Better pattern matching in switch case

[ ] Add template strings

[ ] Add embedded JS

[ ] Create a separate dev branch for static typing

**Parser**

[x] Begin work on the parser

[x] Go through TDOP once more (I've decided to use recursive descent instead of Pratt)

[x] Parse arrays

[x] Parse Call expressions

[ ] Parse Class declarations

[x] Parse switch statements

[ ] Implement scope

[x] Start parsing statements and declarations

[ ] Add better error messages

<!-- [ ] Come up with a way to add operator overloading (There won't be any) -->

[ ] Write several more tests for the parser

[ ] Add the spread operator and support it's parsing

[x] Implement enum parsing

[ ] Parse when expressions after for expressions

[ ] Parse the spread syntax

[ ] Parse object literals

[NO] _Allow keyword overwriting (?)_

**Other**

[ ] Create an error handling module
