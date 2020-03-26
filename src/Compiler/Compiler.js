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
            case Node.IfStmt:
                return compileIf(node);
            case Node.SwitchStmt:
                return compileSwitch(node);
            case Node.BreakStmt:
                return ' break ';
            case Node.ObjectLiteral:
                return compileObj(node);
            case Node.ArrayExpr:
                return compileArr(node);
            case Node.ArrowFunc:
                return compileFuncExpr(node);
            case Node.FuncDecl:
                return compileFuncDecl(node);
            case Node.WhileStmt:
                return compileWhile(node);
            case Node.ToExpr:
                return compileToExpr(node);
            case Node.ForExpr:
                return compileForExpr(node);
            case Node.PreUnaryExpr:
                return compilePreUnaryExpr(node);
            case Node.PostUnaryExpr:
                return compilePostUnaryExpr(node);
            case Node.ReturnStmt:
                return compileReturn(node);
            case Node.ClassDecl:
                return compileClass(node);
            case Node.NewExpr:
                return compileNewExpr(node);
            default:
                console.error('Unexpected value ' + node.type);
                return 'null';
        }
    }

    function compileProg(node) {
        let str = '';
        for (let stmt of node.statements) {
            str += toJs(stmt) + ';\n';
        }
        return str;
    }

    function compileObj(node) {
        let str = '({';
        str += node.properties.map(compileObjProperty).join(',');
        return str + '})';
    }

    function compileObjProperty(node) {
        return `${node.key.string} : ${toJs(node.value)}\n`
    }


    function compileClass(node) {
        let str = `class ${node.name}{`;
        for (let method of node.methods) {
            str += compileMethod(method);
        }
        return str + '}';
    }

    function compileMethod(node) {
        let str = '';
        if (node.static) str += 'static '
        if (node.type == Node.Setter) str += 'set ';
        else if (node.type == Node.Getter) str += 'get ';

        str += node.name + '(';
        if (node.params.length)
            str += node.params.map(compileParam).join(',');
        str += `){\n${toJs(node.body)}}\n`
        return str;
    }

    function compileNewExpr(node){
        return 'new ' + compileCall(node);
    }

    function compileFuncExpr(node) {
        let params = '';
        if (node.params.length)
            params = node.params.map(compileParam).join(',');

        if (node.body.statements.length > 1)
            return `(${params}) => {\n${toJs(node.body)}}\n`;
        else
            return `(${params}) => ${toJs(node.body)}\n`.replace(';', '');
    }

    function compileFuncDecl(node) {
        let str = 'function ';
        if (node.name) str += node.name;
        str += '(' + node.params.map(compileParam).join(',') + ') {\n' +
            toJs(node.body) + '\n}';
        return str;
    }

    function compileReturn(node) {
        let str = 'return ';
        if (node.value)
            str += toJs(node.value);
        return str;
    }

    function compileParam(node) {
        let str = node.name.name;
        if (node.default)
            str += ' = ' + toJs(node.default);
        return str;
    }

    function compileArr(node) {
        let members = node.elements.map(toJs).join(',');
        return '[' + members + ']';
    }

    function compileToExpr(node) {
        let str =
            `(function(){\nlet arr = [];\n let start = ${toJs(node.start)};
\nlet end = ${toJs(node.end)};\nlet step = ${toJs(node.step)};
for(let i = start; i < end ; i += step) arr.push(i);\n return arr;\n})()\n`
        return str;
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

        if (type == Node.RangeExpr || type == Node.ToExpr) {
            str += `let ${iden} = ${toJs(rhs.start)}; ${iden} < ${toJs(rhs.end)}; ${iden} += ${toJs(rhs.step)})`
        } else if (type == Node.Identifier || type == Node.ArrayExpr) {
            str += `let ${iden} of ${toJs(rhs)})`;
        }

        str += `{\n${toJs(node.body)}\n}`;
        return str;
    }

    function compileIf(node) {
        let str = `if(${toJs(node.condition)}){\n${toJs(node.consequent)}\n}`;
        if (node.alternate) {
            if (node.alternate.type == Node.IfStmt)
                str += `else ${compileIf(node.alternate)}`;
            else
                str += `else{\n${toJs(node.alternate)}}\n`

        }
        return str;
    }

    function compileForExpr(node) {
        let iden = toJs(node.inExpr.left),
            type = node.inExpr.right.type,
            rhs = node.inExpr.right,
            action = node.action;

        let str = `(function(){\nlet arr = [];\n
for(let ${iden} = _$i = ${toJs(rhs.start)}; _$i < ${toJs(rhs.end)}; _$i += ${toJs(rhs.step)}){`
        if (node.condition) {
            str += `\n\tif(${toJs(node.condition)})\n\t`
        }

        str += `\tarr.push(${toJs(action)});\n\t${iden} += ${toJs(rhs.step)}   
}\nreturn arr;\n})()`;

        return str;

    }

    function compileWhile(node) {
        return `while (${toJs(node.condition)}){\n${toJs(node.body)}\n}`
    }

    function compileGroup(node) {
        return '(' + toJs(node.value) + ')';
    }

    function compileEnum(node) {
        let str = `const ${node.name} = Object.freeze({`;
        for (let mem of node.members) {
            let name = toJs(mem);
            str += `${name}: '${name}',`
        }
        return str + '})';
    }

    function compileProperty(node) {
        return toJs(node.object) + '.' + toJs(node.member);
    }

    function compileCall(node) {
        let str = `${toJs(node.callee)}(`;
        if (node.args.length)
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
        return `${toJs(node.left)} ${checkBinOp(node.op.string)} ${toJs(node.right)}`
    }

    function compilePreUnaryExpr(node) {
        return `${node.operator.string}${toJs(node.operand)}`;
    }

    function compilePostUnaryExpr(node) {
        return `${toJs(node.operand)} ${node.operator}`;
    }

    function checkBinOp(str) {
        switch (str) {
            case 'and':
                return '&&';
            case 'or':
                return '||';
            case 'is':
                return '===';
            default:
                return str;
        }
    }

    function compileLiteral(node) {
        if (node.string == 'nil')
            return null;
        return ' ' + node.value + ' ';
    }

    return toJs(ast)
}

try {
    module.exports = compileToJs;
} catch (e) {

}