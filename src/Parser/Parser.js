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
    Program: 'Program',
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
    PropertyExpr: 'PropertyExpr',
    ArrayMemExpr: 'ArrayMemExpr',
    GroupingExpr: 'GroupingExpr',
    Identifier: 'Identifier',
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
        if (eof()) return false;
        for (let type of types) {
            if (peek().type === type) {
                next();
                return true;
            }
        }
        return false;
    }

    function error(str) {
        console.log(str); //TODO : extend this later
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
        . , [  (member access) and function call: 11
        (..) grouping : 12
    */

    function program() {
        let node = {
            type: Node.Program,
            statements: [],
            comments: lexOutput.comments
        }
        while (!eof()) {
            node.statements.push(statement());
            //console.log(next())
        }
        return node;
    }

    // PARSING EXPRESSIONS :

    function expression() {
        return assignment();
    }

    function assignment() {
        let node = conditional();

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

    function conditional() {
        let node = or();
        while (match(Token.IF)) {
            let cond = conditional();
            expect(Token.THEN, 'Expected then token');
            let consequent = conditional(),
                alternate = null;
            if (match(Token.ELSE)) {
                alternate = conditional();
            }
            node = {
                type: Node.CondExpr,
                condition: cond,
                consequent: consequent,
                alternate: alternate
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
            node = {
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
            node = {
                type: Node.BinaryExpr,
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
            node = {
                type: Node.BinaryExpr,
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
                type: Node.BinaryExpr,
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
                type: Node.BinaryExpr,
                op: prev(),
                left: node,
                right: node
            }
        }
        return node;
    }

    function unary() {

        if (match(Token.PLUS_PLUS, Token.MINUS_MINUS,
                Token.BANG, Token.MINUS)) {
            return {
                type: Node.PreUnaryExpr,
                operator: prev(),
                operand: unary(),
                tok: prev()
            }
        }
        return postfix();
    }

    function postfix() {
        let node = atom();
        if (match(Token.PLUS_PLUS, Token.MINUS_MINUS)) {
            let token = prev();
            return {
                type: Node.PostUnaryExpr,
                operator: token.string,
                operand: node,
                tok: token
            }
        }
        return node;
    }

    function atom() {
        let node = call();

        // parse property expressions

        while (match(Token.DOT)) {
            let tok = prev(),
                member = primary();
            if (member.type != Node.Identifier)
                error('Member name be Identifier');
            node = {
                type: Node.PropertyExpr,
                object: node,
                member: member,
                tok: tok
            }
        }

        // Parse array member expressions

        if (match(Token.L_SQUARE_BRACE)) {
            let tok = prev(),
                member = expression()
            node = {
                type: Node.ArrayMemExpr,
                object: node,
                member: member,
                tok: tok
            }
            expect(Token.R_SQUARE_BRACE, 'ERRORRRR')
        }
        return node;
    }

    function call() {
        let node = grouping();
        while (match(Token.L_PAREN)) {
            let tok = prev(),
                args = [];
            while (!match(Token.R_PAREN)) {
                args.push(expression());
                match(Token.COMMA);
            }
            node = {
                type: Node.CallExpr,
                callee: node,
                args: args,
                tok: tok
            }
        }
        return node;
    }

    function grouping() {
        if (match(Token.L_PAREN)) {
            let val = expression();
            expect(Token.R_PAREN, 'Expected closing ")"');
            return {
                type: Node.GroupingExpr,
                value: val
            }
        }
        return array();
    }

    function array() {
        if (match(Token.L_SQUARE_BRACE)) {
            let node = {
                type: Node.ArrayExpr,
                elements: []
            }
            while (true) {
                node.elements.push(expression());
                if (!match(Token.COMMA)) {
                    expect(Token.R_SQUARE_BRACE);
                    break;
                }
            }
            return node;
        }
        return primary();
    }

    function primary() {
        if (isLiteral(peek())) {
            return {
                type: Node.Literal,
                tok: next()
            }
        }

        if (match(Token.IDENTIFIER)) {
            let tok = prev();
            return {
                type: Node.Identifier,
                name: tok.string,
                tok: tok
            }
        }
        //TODO : add unexpected case handling here
    }

    // PARSING STATEMENTS:

    function statement() {
        switch (peek().type) {
            case Token.VAR:
            case Token.CONST:
                return varDecl();
            default:
                return expression();
        }
    }

    function varDecl() {
        let node = {
            type: Node.VarDeclaration,
            kind: next().string,
            declarators: [],
            tok: prev()
        }

        node.declarators.push(declarator());
        while (match(Token.COMMA)) {
            node.declarators.push(declarator());
        }

        return node;
    }

    function declarator() {
        let node = {
            name: expect(Token.IDENTIFIER, 'Expected Variable Name')
        }
        if (match(Token.EQUAL))
            node.value = expression();
        return node;
    }
    
    return program();
}