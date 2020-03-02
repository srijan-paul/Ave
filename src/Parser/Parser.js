let Token, lex;

if (typeof module == "object") {
    Token = require('../Lexer/Tokens.js'); // TODO :remove in production
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
    PreUnaryExpr: 'PreUnaryExpr',
    PostUnaryExpr: 'PostUnaryExpr',
    BreakStmt: 'BreakStmt',
    CallExpr: 'CallExpr',
    DotExpr: 'DotExpr',
    ObjExpr: 'ObjExpr',
    SkipStmt: 'SkipStmt',
    ReturnStmt: 'ReturnStmt',
    CondExpr: 'CondExpr',
    MemberExpr: 'MemberExpr',
    GroupingExpr: 'GroupingExpr',
    Identifier: 'Identifier',
    Program: 'Program'
}

function parse(lexOutput) {

    let current = 0,
        tokens = lexOutput.tokens;

    // HELPER FUNCTIONS:

    function eof() {
        return current >= tokens.length || tokens[current].type == Token.EOF;
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

    function isLiteral(token) {
        return token.type === Token.STRING ||
            token.type === Token.NUMBER ||
            token.type === Token.FALSE ||
            token.type === Token.TRUE ||
            token.type === Token.NIL
    }

    function match(...types) {
        if(eof()) return false;
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
            node.statements.push(expression());
            //console.log(next())
        }
        return node;
    }

    function expression() {
        return assignment();
    }

    function assignment() {
        let node = or();
   
        if (match(Token.EQUAL, Token.PLUS_EQUAL, Token.STAR_EQUAL,
                Token.MINUS_EQUAL, Token.SLASH_EQUAL)) {
            let tok = prev();
            let val = assignment();
            // TODO: add L-value check here
            node = {
                type: Node.AssignExpr,
                left: node,
                right: val,
                op: tok
            }
        }
        return node;
    }

    function or() {
        let node = and();
        while (match(Token.OR)) {
            node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: and()
            }
        }
        return node;
    }


    function and() {
        let node = equality();
        while (match(Token.AND)) {
            let node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: equality()
            }
        }
        return node;
    }

    function equality() {
        let node = comparison();
        while (match(Token.EQUAL_EQUAL, Token.BANG_EQUAL)) {
            let node = {
                type: BinaryExpr,
                op: prev(),
                left: node,
                right: comparison()
            }
        }
        return node;
    }

    function comparison() {
        let node = addition();
        while (match(Token.GREATER, Token.LESS_EQUAL, Token.GREATER_EQUAL,
                Token.LESS)) {
            let node = {
                type: BinaryExpr,
                op: prev(),
                left: node,
                right: addition()
            }
        }
        return node;
    }

    function addition() {
        let node = multiplication();
        while (match(Token.PLUS, Token.MINUS)) {
            node = {
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: multiplication()
            }
        }
        return node;
    }

    function multiplication() {
        let node = power();
        while (match(Token.SLASH, Token.STAR, Token.MOD)) {
             node = {
                type: BinaryExpr,
                op: prev(),
                left: node,
                right: power()
            }
        }
        return node;
    }

    function power() {
        let node = unary();
        while (match(Token.STAR_STAR)) {
            node = {
                type: BinaryExpr,
                op: prev(),
                left: node,
                right: unary()
            }
        }
        return node;
    }

    function unary() {
        // TODO: add parsing for postfix ++ and --  
        if (match(Token.PLUS_PLUS, Token.MINUS_MINUS,
                Token.BANG, Token.MINUS)) {
            return {
                type: Node.PreUnaryExpr,
                operator: prev(),
                operand: unary()
            }
        }
        return postfix();
    }

    function postfix() {
        let node = member();
        if (match(Token.PLUS_PLUS, Token.MINUS_MINUS)) {
            return {
                type: Node.PostUnaryExpr,
                operator: prev(),
                operand: node
            }
        }
        return node;
    }

    function member() {
        let node = grouping();
        if (match(Token.DOT)) {
            return {
                type: Node.MemberExpr,
                tok: prev(),
                object: node,
                member: member()
            }
        }

        if (match(Token.L_SQUARE_BRACE)) {
            // TODO: make this work
        }

        return node;
    }

    function grouping() {
        if (match(Token.L_PAREN)) {
            let val = expression();
            expect(Token.R_PAREN);
            return {
                type: Node.GroupingExpr,
                value: val
            }
        }
        return primary();
    }

    function primary() {
        if (isLiteral(peek()))
            return {
                type: Node.Literal,
                tok: next()
            }
        if (match(Token.IDENTIFIER))
            return {
                type: Node.Identifier,
                name: prev().string,
                tok: prev()
            }

        //TODO : add unexpected case handling here
    }

    return program();
}
