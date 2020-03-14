if (typeof module == "object") {
    Token = require('../Lexer/Tokens.js'); // TODO :remove in production
    lex = require('../Lexer/Lexer.js');
    Node = require('../Parser/NodeTypes');
}

// starting with a simple expression parser
// converts a stream of tokens into an AST

function binaryNode(left, op, right) {
    return {
        type: Node.BinaryExpr,
        left: left,
        op: op,
        right: right
    }
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

    function peekNext() {
        if (eof() || current + 1 >= tokens.length) return null
        return tokens[current + 1];
    }

    function expect(tokType, err) {
        if (!peek() || peek().type != tokType)
            throw new Error(err);
        return next();
    }

    function check(tokType) {
        return peek().type === tokType;
    }

    function checkNext(tokType) {
        if (!peek() || !peekNext()) return false;
        return (peekNext().type === tokType)
    }

    function consume(tokType) {
        if (peek() && peek().type == tokType)
            return next();
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
        to-with:
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
        while (match(Token.OR))
            node = binaryNode(node, prev(), and());
        return node;
    }


    function and() {
        let node = equality();
        while (match(Token.AND))
            node = binaryNode(node, prev(), equality());
        return node;
    }

    function equality() {
        let node = comparison();
        while (match(Token.EQUAL_EQUAL, Token.BANG_EQUAL)) {
            node = binaryNode(node, prev(), comparison());
        }
        return node;
    }

    function comparison() {
        let node = inExpr();
        while (match(Token.GREATER, Token.LESS_EQUAL, Token.GREATER_EQUAL,
                Token.LESS)) {
            node = binaryNode(node, prev(), addition());
        }
        return node;
    }

    function inExpr() {
        let node = forExpr();
        if (match(Token.IN)) {
            node = {
                type: Node.InExpr,
                left: node,
                right: null
            }

            if (match(Token.L_BRACE))
                node.right = range();
            else
                node.right = expression();
        }
        return node;
    }

    function range() {
        let node = {
            type: Node.RangeExpr,
            start: {
                type: Node.Literal,
                value: 0
            },
            end: null,
            step: {
                type: Node.Literal,
                value: 1
            }
        }
        node.start = expression();
        if (match(Token.COMMA)) {
            node.end = expression();
            if (match(Token.COMMA))
                node.step = expression();
        }
        expect(Token.R_BRACE, 'Expected closing "}" for range expression');
        return node;
    }

    function forExpr() {
        let node = toExpr();
        // A for token in the same line means an for expression
        // a for token in a separate line is a for statement 
        // and not a part of this expression

        if (!eof() &&
            peek().type == Token.FOR &&
            peek().line == prev().line) {
            next();
            node = {
                type: Node.ForExpr,
                inExpr: inExpr(),
                action: node,
                condition: null
            }
            if (node.inExpr.type != Node.InExpr) error('Expected "in" expression');
            if (node.inExpr.right.type != Node.ToExpr &&
                node.inExpr.left.type !== Node.Indentifier)
                error('Expected identifier.');
            if (match(Token.WHEN)) node.condition = expression();
        }
        return node;
    }


    function toExpr() {
        let node = addition();
        if (match(Token.TO)) {
            node = {
                type: Node.ToExpr,
                start: node,
                end: addition(),
                step: {
                    type: Node.Literal,
                    value: 1
                }
            }

            if (match(Token.WITH)) {
                node.step = addition();
            }
        }
        return node;
    }

    function addition() {
        let node = multiplication();
        while (match(Token.PLUS, Token.MINUS))
            node = binaryNode(node, prev(), multiplication());

        return node;
    }

    function multiplication() {
        let node = power();
        while (match(Token.SLASH, Token.STAR, Token.MOD))
            node = binaryNode(node, prev(), power());

        return node;
    }

    function power() {
        let node = unary();
        while (match(Token.STAR_STAR))
            node = binaryNode(node, prev(), unary());

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
                value: next().string,
                tok: prev()
            }
        }

        if (check(Token.IDENTIFIER)) {
            if (checkNext(Token.COLON)) {
                return parseObject();
            }

            let tok = next();
            return {
                type: Node.Identifier,
                name: tok.string,
                tok: tok
            }
        }

        if (match(Token.INDENT)) {
            let expr = expression();
            expect(Token.DEDENT, 'Unexpected indentation.');
            return expr;
        }

        if (match(Token.PIPE)) {
            return parseLambda();
        }

        if (match(Token.L_BRACE)) {
            return range();
        }

        //TODO : add unexpected case handling here

        if (match(Token.EOF))
            return;
        error('Unexpected token ' + next().string);
    }

    function parseObject() {
        let node = {
            type: Node.ObjectLiteral,
            properties: []
        }
        while (check(Token.IDENTIFIER) && checkNext(Token.COLON)) {
            node.properties.push(parseObjectProp());
        }
        return node;
    }

    function parseObjectProp() {
        let node = {
            type: Node.ObjectProperty,
            key: expect(Token.IDENTIFIER, 'Expected name as object property'),
            value: null
        }
        expect(Token.COLON, 'Expected ":" after property name.');
        node.value = expression();
        return node;
    }

    function parseLambda() {
        let node = {
            type: Node.FuncExpr,
            params: parseLambdaParams(),
            body: {
                type: Node.Program,
                statements: []
            }
        }
        expect(Token.ARROW, 'Expected "->" token ');
        if (match(Token.INDENT)) {
            while (!match(Token.DEDENT)) {
                node.body.statements.push(statement());
            }
        } else {
            node.body.statements.push(statement());
        }
        if (!node.body.statements.length)
            error('Expected function body after "->"');
        return node
    }

    function parseLambdaParams() {
        let params = [];
        while (!match(Token.PIPE)) {
            let node = {
                type: Node.FuncParam,
                name: expect(Token.IDENTIFIER, 'Expected name as identifier.'),
            }
            if (match(Token.EQUAL)) {
                node.default = expression();
            }
            consume(Token.COMMA);
            params.push(node);
        }
        return params;
    }

    // PARSING STATEMENTS:

    function statement() {
        if (eof()) error('Unexpected end of input');
        switch (peek().type) {
            case Token.VAR:
            case Token.CONST:
            case Token.LET:
                return varDecl();
            case Token.FOR:
                return forStmt();
            case Token.IF:
                next();
                return IfStmt();
            case Token.ENUM:
                next();
                return enumDecl();
            case Token.WHILE:
                return whileStmt();
            case Token.RETURN:
                return returnStmt();
            case Token.BREAK:
                return breakStmt();
            case Token.CONTINUE:
                return continueStmt();
            case Token.FN:
                return func();
            case Token.SWITCH:
                return switchStmt();
            case Token.FALL:
                return fallStmt();
            default:
                return expression();
        }
    }

    function switchStmt() {
        next();
        let node = {
            type: Node.SwitchStmt,
            discriminant: expression(),
            cases: []
        }
        // users may optinally add colons for more readability
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block');
        while (!match(Token.DEDENT)) {
            node.cases.push(parseSwitchCase());
        }

        return node;
    }

    function parseSwitchCase() {
        if (!match(Token.CASE, Token.DEFAULT))
            error('Unexpected Token ' + prev().string);
        let node = {
            type: Node.SwitchCase,
            tests: [],
            consequent: [],
            kind: prev().string,
            fall: false
        }

        if (prev().type !== Token.DEFAULT) {
            node.tests.push(expression());
            while (match(Token.COMMA)) {
                node.tests.push(expression());
            }
        }

        consume(Token.COLON);

        if (match(Token.INDENT)) {
            while (!match(Token.DEDENT)) {
                if (match(Token.FALL)) {
                    node.fall = true;
                    if (!check(Token.CASE) && !check(Token.DEDENT) &&
                        !check(Token.DEFAULT))
                        error('Fall must be the last statement in switch case.');
                } else
                    node.consequent.push(statement());
            }
        } else if (!check(Token.CASE) &&
            !check(Token.DEFAULT)) {
            if (match(Token.FALL)) node.fall = true;
            else node.consequent.push(statement());
        }
        return node;
    }

    function func() {
        next();
        let name = expect(Token.IDENTIFIER, 'Expected name.');
        let node = {
            type: Node.FuncDecl,
            name: name.string,
            tok: name,
            params: parseParams(),
            body: {
                type: Node.Program,
                statements: []
            }
        }

        if (match(Token.IDENTIFIER)) {
            node.name = prev().string;
            node.tok = prev();
        }

        expect(Token.INDENT, 'Expected Indented block');
        while (!match(Token.DEDENT)) {
            node.body.statements.push(statement());
        }
        return node;
    }

    function parseParams() {
        expect(Token.L_PAREN, 'Expected "("');
        let params = []
        while (!match(Token.R_PAREN)) {
            let node = {
                type: Node.FuncParam,
                name: expect(Token.IDENTIFIER, 'Expected name as identifier.'),
            }
            if (match(Token.EQUAL)) {
                node.default = expression();
            }
            consume(Token.COMMA);
            params.push(node);
        }
        return params;
    }

    function breakStmt() {
        return {
            type: Node.BreakStmt,
            tok: next()
        }
    }

    function fallStmt() {
        return {
            type: Node.FallStmt,
            tok: next()
        }
    }


    function returnStmt() {
        let tok = next();
        let node = {
            type: Node.ReturnStmt,
            value: null,
            tok: tok
        }
        if (!check(Token.DEDENT) && !eof())
            node.val = expression();
        return node;
    }

    function continueStmt() {
        return {
            type: Node.ContinueStmt,
            tok: next()
        }
    }

    function whileStmt() {
        let tok = next();
        let node = {
            type: Node.WhileStmt,
            condition: expression(),
            body: {
                type: Node.Program,
                statements: [],
                tok: tok
            }
        }
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block')
        while (!match(Token.DEDENT)) {
            node.body.statements.push(statement());
        }
        return node;
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
            inExpr: null,
            body: {
                type: Node.Program,
                statements: []
            }
        }
        node.inExpr = inExpr();
        if (node.inExpr.type != Node.InExpr) error('expected in expression')
        consume(Token.COLON);
        expect(Token.INDENT, 'Expected Indented block');

        while (!match(Token.DEDENT, Token.EOF))
            node.body.statements.push(statement());
        return node;
    }

    function IfStmt() {
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
        if (match(Token.ELIF)) {
            node.alternate = IfStmt();
        } else if (match(Token.ELSE)) {
            node.alternate = {
                type: Node.Program,
                statements: []
            }
            consume(Token.COLON);
            expect(Token.INDENT, 'Expected Indented block');
            while (!match(Token.DEDENT)) {
                node.alternate.statements.push(statement())
            }
        }
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

try {
    module.exports = parse
} catch (e) {

}