const lex = require('./Lexer/Lexer.js');
const parse = require('./Parser/Parser.js');
const compile = require('./Compiler/Compiler.js');

module.exports = {
    lex: lex,
    parse: parse,
    compile: compile
}