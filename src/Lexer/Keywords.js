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
    "def": Token.DEF,
    "return": Token.RETURN,
    "this": Token.THIS,
    "true": Token.TRUE,
    "while": Token.WHILE,
    "end": Token.END,
    "break": Token.BREAK,
    "skip": Token.SKIP,
    "static": Token.STATIC,
    "class": Token.CLASS,
    "new": Token.NEW
}

try {
    module.exports = keywords;
} catch (e) {

}