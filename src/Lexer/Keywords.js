if (typeof module == "object") {
    Token = require('./Tokens.js');
}

const keywords = {
    "and": Token.AND,
    "else": Token.ELSE,
    "false": Token.FALSE,
    "for": Token.FOR,
    "fn": Token.FN,
    "if": Token.IF,
    "nil": Token.NIL,
    "or": Token.OR,
    "var": Token.VAR,
    "return": Token.RETURN,
    "this": Token.THIS,
    "true": Token.TRUE,
    "while": Token.WHILE,
    "break": Token.BREAK,
    "continue": Token.CONTINUE,
    "static": Token.STATIC,
    "class": Token.CLASS,
    "enum": Token.ENUM,
    "in" : Token.IN,
    "elif": Token.ELIF
}

try {
    module.exports = keywords;
} catch (e) {

}