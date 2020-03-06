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
    InExpr: 'InExpr',
    ForExpr: 'ForExpr',
    Enum: 'Enum'
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

    function expect(tokType, err) {
        if (!peek() || peek().type != tokType)
            throw new Error(err);
        return next();
    }

    function check(tokType) {
        return peek().type === tokType;
    }

    function consume(tokType) {
        if (peek() && peek().type == tokType)
            next();
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
                return next();
            }
        }
        return false;
    }

    function error(str) {
        console.error(str); //TODO : extend this later
    }

    // I start off with a simple expression parser that implements recursive
    // descent parsing and expand upon what I have as I go


    /*
        ==PRECEDENCE TABLE==

        = , += , -= , **=, *= , /=  :1
        if then else 2
        in 3
        for 4
        or : 5
        and : 6
        ==, != : 7
        >, >=,<, <=: 8
        + - : 9
        %,*,/: 10
        **: 11
        (prefix) --, ++, (unary) +, - , ! : 12
        (postfix) ++, -- : 13
        . , [  (member access) and function call: 14
        (..) grouping : 15
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
        return assignment()
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
        while (peek() &&
            peek().type == Token.IF &&
            peek().line == prev().line) {
            
                next();
            let cond = or(),
                alternate = null;
            if (match(Token.ELSE)) {
                alternate = or();
            }
            node = {
                type: Node.CondExpr,
                condition: cond,
                consequent: node,
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
        let node = inExpr();
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

    function inExpr() {
        let node = forExpr();
        if (match(Token.IN)) {
            node = {
                type: Node.InExpr,
                left: node,
                right: atom()
            }
        }
        return node;
    }

    function forExpr() {
        let node = addition();

        // A for token in the same line means an for expression
        // a for token in a separate line is a for statement 
        // and not a part of this expression

        if (!eof() &&
            peek().type == Token.FOR &&
            peek().line == prev().line) {
            next();
            node = {
                type: Node.ForExpr,
                inExpr: conditional(),
                action: node
            }
            if (node.inExpr.type !== Node.InExpr)
                error('Expected in');
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
            let tok = prev();
            let member = atom();
            //TODO: add valid member check here
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
                member = expression();
            node = {
                type: Node.ArrayMemExpr,
                object: node,
                member: member,
                tok: tok
            }
            expect(Token.R_SQUARE_BRACE, 'ERRORRRR');
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
                    expect(Token.R_SQUARE_BRACE, 'Expected "]"');
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
        console.log(next())
        if (match(Token.EOF))
            return;
        error('Unexpected token ' + next().string);
    }

    // PARSING STATEMENTS:

    function statement() {
        switch (peek().type) {
            case Token.VAR:
            case Token.CONST:
                return varDecl();
            case Token.FOR:
                return forStmt();
            case Token.IF:
                return IfStmt();
            case Token.ENUM:
                next();
                return enumDecl();
            default:
                return expression();
        }
    }

    function enumDecl() {
        let tok = expect(Token.IDENTIFIER, 'Expected name');
        let node = {
            type: Node.Enum,
            name: tok.string,
            members: [],
            tok: tok,
        }
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block');
        while (!match(Token.DEDENT)) {
            let mem = primary();
            if (mem.type != Node.Identifier) {
                error('Expected Name as enum literal.');
            }
            node.members.push(mem);
            if (!match(Token.COMMA)) {
                expect(Token.DEDENT, 'expected indented block');
                break;
            }
        }
        return node;
    }

    function forStmt() {
        next();
        let node = {
            type: Node.ForStmt,
            iterator: inExpr(),
            body: {
                type: Node.Program,
                statements: []
            }
        }
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block');

        while (!match(Token.DEDENT, Token.EOF))
            node.body.statements.push(statement());
        return node;
    }

    function IfStmt() {
        next();
        let node = {
            type: Node.IfStmt,
            condition: expression(),
            consequent: {
                type: Node.Program,
                statements: []
            },
            alternate: null
        }
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block');
        while (!match(Token.DEDENT, Token.EOF))
            node.consequent.statements.push(statement());
        return node;
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