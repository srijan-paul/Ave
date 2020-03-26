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
    "default": Token.DEFAULT,
    "const": Token.CONST,
    "let": Token.LET,
    "fall": Token.FALL,
    "to": Token.TO,
    "is": Token.IS,
    "with": Token.WITH,
    "when" : Token.WHEN,
    "set": Token.SET,
    "get": Token.GET,
    "static": Token.STATIC,
    "new" : Token.NEW,
    "function": Token.FN
}

try {
    module.exports = keywords;
} catch (e) {

}