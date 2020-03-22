const fs = require('fs');
const lex = require('../../src/Lexer/Lexer.js');
const parse = require('../../src/Parser/Parser.js');
const compile = require('../../src/Compiler/Compiler.js');

// the files inside the testDir directory are compiled
// and the compiled JS code is logged 

const testDir = '../indents/' 

fs.readdir(testDir, (err, files) => {
    files.forEach(file => {
        console.log(file);

        fs.readFile(testDir + '/' + file, {
            encoding: 'utf-8'
        }, (err, data) => {
            const tokens  = lex(data);
            console.log(tokens)
            const ast = parse(tokens);
            const js = compile(ast);
            console.log(js);
            eval(js)
        });
    });
});