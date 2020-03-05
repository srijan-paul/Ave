const Token = Object.freeze({
    // tokens for easy lexing
    EOF: 'EOF',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',

    //single character tokens :
    EQUAL: 'EQUAL',
    PIPE: 'PIPE',
    PLUS: 'PLUS',
    PLUS_EQUAL: 'PLUS_EQUAL',
    PLUS_PLUS: 'PLUS_PLUS',
    MINUS: 'MINUS',
    MINUS_MINUS: 'MINUS_MINUS',
    MINUS_EQUAL: 'MINUS_EQUAL',
    STAR: 'STAR',
    STAR_STAR: 'STAR_STAR',
    MOD: 'MOD',
    R_PAREN: 'R_PAREN',
    L_PAREN: 'L_PAREN',
    L_BRACE: 'L_BRACE',
    R_BRACE: 'R_BRACE',
    L_SQUARE_BRACE: 'L_SQUARE_BRACE',
    R_SQUARE_BRACE: 'R_SQUARE_BRACE',
    SLASH: 'SLASH',
    SEMICOLON: 'SEMICOLON',
    COLON: 'COLON',
    COMMA: 'COMMA',
    DOT: 'DOT',
    AMPERSAND: 'AMPERSAND',
    
    BANG: 'BANG',
    BANG_EQUAL: 'BANG_EQUAL',
    LESS: 'LESS',
    GREATER: 'GREATER',
    LESS_EQUAL: 'LESS_EQUAL',
    GREATER_EQUAL: 'GREATER_EQUAL',
    STAR_EQUAL: 'STAR_EQUAL',
    SLASH_EQUAL: 'SLASH_EQUAL',
    EQUAL_EQUAL: 'EQUAL_EQUAL',
    PRINT: 'PRINT',
    ARROW: 'ARROW',

    //literals 
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',

    //KEYWORDS :
    AND: 'AND',
    BREAK: 'BREAK',
    SKIP: 'SKIP',
    OR: 'OR',
    IF: 'IF',
    FOR: 'FOR',
    NIL: 'NIL',
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    WHILE: 'WHILE',
    RETURN: 'RETURN',
    ELSE: 'ELSE',
    FN: 'FN',
    VAR: 'VAR',
    CONST: 'CONST',
    STATIC: 'STATIC',
    SELF: 'SELF',
    CLASS: 'CLASS',
    NEW: 'NEW',
    ENUM: 'ENUM',
    IN: 'IN'
});

try {
    module.exports = Token;
} catch (e) {

}