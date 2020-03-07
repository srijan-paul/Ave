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
    "null": Token.NULL,
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
    "in": Token.IN,
    "elif": Token.ELIF,
    "switch": Token.SWITCH,
    "case": Token.CASE,
    "const": Token.CONST,
    "let": Token.LET
}

try {
    module.exports = keywords;
} catch (e) {

}