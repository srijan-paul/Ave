if (typeof module == "object") {
    Token = require('./Tokens.js');
}

const keywords = {
    "and": Token.AND,
    "else": Token.ELSE,
    "false": Token.FALSE,
    "for": Token.FOR,
    "then": Token.THEN,
    "fn": Token.FN,
    "if": Token.IF,
    "nil": Token.NIL,
    "or": Token.OR,
    "print": Token.PRINT,
    "var": Token.VAR,
    "return": Token.RETURN,
    "this": Token.THIS,
    "true": Token.TRUE,
    "while": Token.WHILE,
    "break": Token.BREAK,
    "skip": Token.SKIP,
    "static": Token.STATIC,
    "class": Token.CLASS,
    "enum": Token.ENUM
}

try {
    module.exports = keywords;
} catch (e) {

}