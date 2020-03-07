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
            case Node.Program:
                return compileProg(node);
            case Node.GroupingExpr:
                return compileGroup(node);
            case Node.Enum:
                return compileEnum(node);
            case Node.PropertyExpr:
                return compileProperty(node);
            case Node.CallExpr:
                return compileCall(node);
            default:
                console.error('Unexpected value');
        }
    }

    function compileProg(node) {
        let str = '';
        for (let stmt of node.statements) {
            str += toJs(stmt);
        }
        return str;
    }

    function compileGroup(node) {
        return '(' + toJs(node.value) + ')';
    }

    function compileEnum(node) {
        let str = `const ${node.name} = {`;
        for (let mem of node.members) {
            let name = toJs(mem);
            str += `${name}: '${name}',`
        }
        return str + '}';
    }

    function compileProperty(node) {
        return toJs(node.object) + '.' + toJs(node.member);
    }

    function compileCall(node){
        let str = `${toJs(node.callee)}(`;
        if(node.args.length)
            str += node.args.map(toJs).join(',');
        return str + ')';
    }

    function compileVarDecl(node) {
        let decls = [];
        for (let decl of node.declarators) {
            decls.push(compileDeclarator(decl));
        }
        return node.kind + ' ' + decls.join(',');
    }

    function compileDeclarator(node) {
        let str = node.name.string;
        if (node.value)
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

    return toJs(ast)
}

try {
    module.exports = compileToJs;
} catch (e) {

}