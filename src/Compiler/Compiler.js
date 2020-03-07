if (typeof module == 'object') {
    Node = require('../Parser/NodeTypes.js');
}

function compileToJs(ast) {
    function toJs(node) {
        switch (node.type) {
            case Node.Identifier:
                return compileIden(node);
            case Node.Literal:
                return compileLiteral(node);
            case Node.BinaryExpr:
                return compileBinaryExpr(node);
            case Node.AssignExpr:
                return compileAssign(node);
            case Node.VarDeclaration:
                return compileVarDecl(node);
            default:
                console.error('Unexpected value');
        }
    }

    function compileProg(node) {

    }

    function compileVarDecl(node){
        let decls = [];
        for(let decl of node.declarators){
            decls.push(compileDeclarator(decl));
        }
        return node.kind + ' ' + decls.join(',');
    }

    function compileDeclarator(node){
        let str = node.name.string;
        if(node.value)
            str += ' = ' + toJs(node.value);
        return str;
    }


    function compileAssign(node) {
        return `${toJs(node.left)} = ${toJs(node.right)}`
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
        return node.tok.string;
    }

    return toJs(ast.statements[0])
}