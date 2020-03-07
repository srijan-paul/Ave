if (typeof module == 'object') {
    Node = require('../Parser/NodeTypes.js');
}

function compileToJs(ast) {
    function toJs(node) {
        switch (node) {
            case Node.Identifier:
                return compileIden(node);
            case Node.Literal:
                return compileLiteral(node);
            case Node.BinaryExpr:
                return compileBinaryExpr(node);
            default:
                console.error('Unexpected value');
        }
    }

    function compileProg(node) {

    }

    function compileIden(iden) {
        return iden.name;
    }

    function compileBinaryExpr(node) {
        return `${toJs(node.left)} ${node.op.string} ${toJs(node.right)}`
    }


    function compileLiteral(node) {
        if (node.string == 'nil')
            return null;
        return tok.string;
    }
}