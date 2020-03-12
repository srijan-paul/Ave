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
            case Node.ForStmt:
                return compileFor(node);
            case Node.SwitchStmt:
                return compileSwitch(node);
            case Node.BreakStmt:
                return ' break ';
            case Node.ObjectLiteral:
                return compileObj(node);
            case Node.ArrayExpr:
                return compileArr(node);
            case Node.FuncExpr:
                return compileFuncExpr(node);
            case Node.FunDecl:
                return compileFuncDecl(node);
            case Node.WhileStmt:
                return compileWhile(node);
            default:
                console.error('Unexpected value');
                return 'null';
        }
    }

    function compileProg(node) {
        let str = '';
        for (let stmt of node.statements) {
            str += toJs(stmt);
        }
        return str;
    }

    function compileObj(node) {
        let str = '{';
        str += node.properties.map(compileObjProperty).join(',');
        return str + '}';
    }

    function compileObjProperty(node) {
        return `${node.key.string} : ${toJs(node.value)}\n`
    }

    function compileFuncExpr(node) {
        let params = '';
        if (node.params.length)
            params = node.params.map(compileParam).join(',');

        if (node.body.statements.length > 1)
            return `(${params}) => {${toJs(node.body)}}\n`;
        else
            return `(${params}) => ${toJs(node.body)}\n`;
    }

    function compileFuncDecl(node) {
        let str = 'function ';
        if (node.name) str += name;
        str += '(' + node.params.map(compileParam).join(',') + ') {\n' +
            toJs(node.body) + '\n}';
        return str;
    }

    function compileParam(node) {
        let str = node.name.string;
        if (node.default)
            str += ' = ' + toJs(node.default);
        return str;
    }

    function compileArr(node) {
        let members = node.elements.map(toJs).join(',');
        return '[' + members + ']';
    }

    function compileSwitch(node) {
        let str = `switch(${toJs(node.discriminant)}){\n`;
        for (let switchCase of node.cases) {
            str += compileSwitchCase(switchCase);
        }
        return str + '\n}';
    }

    function compileSwitchCase(node) {
        let str = ''
        for (let i = 0; i < node.tests.length - 1; i++) {
            str += `case ${toJs(node.tests[i])}:\n`;
        }

        if (node.tests.length)
            str += `case ${toJs(node.tests[node.tests.length - 1])}:\n`;
        else
            str += 'default:\n'


        for (let stmt of node.consequent)
            str += toJs(stmt) + '\n';

        if (!node.fall)
            str += 'break;\n';
        return str;
    }

    function compileFor(node) {
        let str = `for(`;
        let iden = toJs(node.inExpr.left),
            type = node.inExpr.right.type,
            rhs = node.inExpr.right;

        if (type == Node.RangeExpr) {

            if (rhs.to) {
                str += `let ${iden} = ${toJs(rhs.from)};` +
                    `${iden} < ${toJs(rhs.to)};`
                if (rhs.step)
                    str += `${iden} += ${toJs(rhs.step)}`
                else
                    str += `${iden}++)`
            } else {
                str += `let ${iden} = 0;` +
                    `${iden} < ${toJs(rhs.from)}; ${iden}++)`
            }

        } else if (type == Node.Identifier || type == Node.ArrayExpr) {
            str += `let ${iden} of ${toJs(rhs)})`;
        } else if (type == Node.ToExpr) {
            //TODO: extend this part
        }

        str += `{\n${toJs(node.body)}\n}`;
        return str;
    }

    function compileWhile(node) {
        return `while (${toJs(node.condition)}){\n${toJs(node.body)}\n}`
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

    function compileCall(node) {
        let str = `${toJs(node.callee)}(`;
        if (node.args.length)
            str += node.args.map(toJs).join(',');
        return str + ') ';
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
        return ' ' + node.tok.string + ' ';
    }

    return toJs(ast)
}

try {
    module.exports = compileToJs;
} catch (e) {

}