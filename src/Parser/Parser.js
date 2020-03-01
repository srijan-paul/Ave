let Token, lex;

if (typeof module == "object") {
    Token = require('../Lexer/Tokens.js');
    lex = require('../Lexer/Lexer.js')
}

// starting with a simple expression parser

// converts a stream of tokens into an AST



const Node = {
    BinaryExpr: 'BinaryExpr',
    AssignExpr: 'AssignExpr',
    FuncDecl: 'FuncDecl',
    Prog: 'Program',
    Literal: 'Literal',
    ForStmt: 'ForStmt',
    IfStmt: 'IfStmt',
    WhileStmt: 'WhileStmt',
    VarDeclaration: 'VarDeclaration',
    VarDeclarator: 'VarDeclarator',
    ArrayExpr: 'ArrayExpr',
    UnaryExpr: 'UnaryExpr',
    BreakStmt: 'BreakStmt',
    CallExpr: 'CallExpr',
    DotExpr: 'DotExpr',
    ObjExpr: 'ObjExpr',
    SkipStmt: 'SkipStmt',
    ReturnStmt: 'ReturnStmt',
    CondExpr: 'CondExpr',
    Program: 'Program'
}

function parse(lexOutput) {

    let current = 0,
        tokens = lexOutput.tokens;

    // HELPER FUNCTIONS:

    function eof() {
        return current >= tokens.length;
    }

    function next() {
        if (eof()) return null;
        return tokens[current++];
    }

    function prev() {
        return tokens[current - 1];
    }

    function peek() {
        if (eof()) return null;
        return tokens[current];
    }

    function expect(tokType) {
        if (peek().type != tokType)
            throw new Error('Placeholder');
        return next();
    }

    function check(tokType) {
        return peek().type === tokType;
    }

    function match(...types) {
        for (let type of types) {
            if (peek().type === type) {
                next();
                return true;
            }
        }
        return false;
    }

    // I start off with a simple expression parser that implements recursive
    // descent parsing and expand upon what I have as I go


    /*
        ==PRECEDENCE TABLE==

        = , += , -= , **=, *= , /=  :1
        if then else 2
        or : 3
        and : 4
        ==, != : 4
        >, >=,<, <=: 5
        + - : 6
        %,*,/: 7
        **: 8
        (prefix) --, ++, (unary) +, - , ! : 9
        (postfix) ++, -- : 10
        . , [  (member access) : 11
        (..) grouping : 12
    */

    function program() {
        let node = {
            type: Node.Program,
            statements: [],
            comments: lexOutput.comments
        }
        while (!eof()) {
            statements.push(expression());
        }
        return node;
    }

    function expression() {
        return assignment();
    }

    function assignment() {
        let node = or();
        while (match(Token.EQUAL, Token.PLUS_EQUAL, Token.STAR_EQUAL,
                Token.MINUS_EQUAL, Token.SLASH_EQUAL)) {
            let rvalue = or();
            node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: rvalue
            }
        }
        return node;
    }

    function or(){
        let node = and();
        while(match(Token.OR)){
            let node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: and()
            }
        }
        return node;
    }


    function and(){
        let node = equality();
        while(match(Token.AND)){
            let node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: equality()
            }
        }
        return node;
    }

    function equality(){
        let node = comparison();
        while(match(Token.EQUAL_EQUAL, Token.BANG_EQUAL)){
            let node = {
                type: BinaryExpr,
                op: prev(),
                left: node,
                right: comparison()
            }
        }
        return node;
    }

    function comparison(){
        // TODO : Fill this guy
    }

    return program();
}

const test =
    `a = b or c`
parse(lex(test));