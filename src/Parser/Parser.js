let Token;

if (typeof module == "object") {
    Token = require('../Lexer/Tokens.js');
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
    ReturnStmt: 'ReturnStmt'
}

function parse(tokens) {

    let current = 0;

    // HELPER FUNCTIONS:

    function eof() {
        return current >= tokens.length;
    }

    function next() {
        if (eof()) return null;
        return tokens[current++];
    }

    function peek() {
        if (eof()) return null;
        return tokens[current];
    }

    function expect(tokType) {
        if (next().type != tokType)
            throw new Error('Placeholder');
        return true;
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

    // I start off with a simple expression parser that implements pratt parsing
    // and expand upon what I have as I go
    
    const symbolTable = {};

    function symbol(id, bp = 0) {
        let sym = symbolTable[id];
        if (sym) {
            if (bp > sym.lbp)
                sym.lbp = bp
        } else {
            sym = {
                lbp: bp,
                nud: null,
                led: null
            }
            symbolTable[id] = sym;
        }
        return sym;
    }

    function infix(id, bp, led) {
        let sym = symbol(id, bp);
        sym.led = led || function (left) {
            this.left = left;
            this.second = expression(bp);
            this.arity = 'binary';
            return this;
        }
        return sym;
    }

    console.log(symbolTable);
}