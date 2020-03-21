const process = require('process');
const fs = require('fs');
const ave = require('./src/ave.js');

const args = process.argv;

if (args.length == 2) {
    console.log('Ave lang')
} else {
    let path = args[2];
    fs.readFile(path, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            const tokens = ave.lex(data);
            const ast = ave.parse(tokens);
            const js = ave.compile(ast);
            console.log(js);
        } else {
            console.error(err);
        }
    });
}