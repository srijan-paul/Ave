try {
    module.exports = lex
} catch (e) {

}

if (typeof module == "object") {
    Token = require('../Lexer/Tokens.js');
    keywords = require('../Lexer/Keywords.js');
}

const indentLen = 4;

function lex(text) {
    let start = 0,
        current = 0,
        line = 1,
        tokens = [],
        currentLevel = 0,
        levels = [],
        brackets = [];

    function eof() {
        return current > text.length;
    }

    function next() {
        return text.charAt(current++);
    }

    function peek() {
        return text.charAt(current);
    }

    function peekNext() {
        if (current + 1 > text.length) return null;
        return text.charAt(current + 1);
    }

    function isDigit(c) {
        return c >= '0' && c <= '9';
    }

    function isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    function isAlphaNumeric(c) {
        return isDigit(c) || isAlpha(c);
    }

    function addToken(type, literal) {
        let string = text.substring(start, current);
        let tk = {
            type: type,
            string: string,
            value: (literal == undefined) ? "" : literal,
            line: line,
            start: start,
            end: current
        }
        tokens.push(tk);
    }

    function getNum() {
        while (isDigit(peek())) next();

        if (peek() === '.' && isDigit(peekNext())) {
            next();
            while (isDigit(peek())) {
                next();
            }
        }
        let txt = text.substring(start, current);
        addToken(Token.NUMBER, parseFloat(txt))
    }

    function getIdentifier() {
        while (isAlphaNumeric(peek())) next();
        let txt = text.substring(start, current);
        let type = Token.IDENTIFIER;
        if (keywords[txt]) {
            type = keywords[txt];
            addToken(type);
        } else {
            addToken(type, txt);
        }
    }

    function getString() {
        while (peek() !== '"' && !eof()) {
            if (peek() === '\n') line++;
            next();
        }
        if (eof()) throw new Error(`Unterminated String literal at line ${line}`);
        next(); //consume the ending "
        addToken(Token.STRING, text.substring(start + 1, current - 1));
    }

    function match(expected) {
        if (eof()) return false
        if (text.charAt(current) !== expected) return false;
        current++;
        return true;
    }

    function scanToken(c) {
        switch (c) {
            case '(':
                addToken(Token.L_PAREN);
                brackets.push(c);
                break;
            case ')':
                addToken(Token.R_PAREN);
                brackets.pop();
                break;
            case '[':
                addToken(Token.L_SQUARE_BRACE);
                brackets.push(c);
                break;
            case ']':
                brackets.pop();
                addToken(Token.R_SQUARE_BRACE);
                break;
            case '{':
                addToken(Token.L_BRACE);
                break;
            case '}':
                addToken(Token.R_BRACE);
                break;
            case ',':
                addToken(Token.COMMA);
                break;
            case '.':
                addToken(Token.DOT);
                break;
            case '%':
                addToken(Token.MOD);
                break;
            case ':':
                addToken(Token.COLON);
                break;
            case '-':
                addToken(match('=') ? Token.PLUS_EQUAL : Token.MINUS);
                break;
            case '+':
                addToken(match('=') ? Token.PLUS_EQUAL : Token.PLUS);
                break;
            case ';':
                addToken(Token.SEMICOLON);
                break;
            case '*':
                if (match('=')) {
                    addToken(Token.STAR_EQUAL);
                } else if (match('**')) {
                    addToken(Token.STAR_STAR);
                } else {
                    addToken(Token.STAR);
                }
                break;
            case '/':
                addToken(match('=') ? Token.SLASH_EQUAL : Token.SLASH);
                break;
            case '=':
                addToken(match('=') ? Token.EQUAL_EQUAL : Token.EQUAL);
                break;
            case '!':
                addToken(match('=') ? Token.BANG_EQUAL : Token.BANG);
                break;
            case '<':
                if (match('='))
                    addToken(Token.LESS_EQUAL);
                else if (match('-'))
                    addToken(Token.ARROW);
                else
                    addToken(Token.LESS);
                break;
            case '>':
                addToken(match('=') ? Token.GREATER_EQUAL : Token.GREATER);
                break;
            case '#':
                while (!eof() && peek() !== '\n') next();
                break;
            case '|':
                addToken(Token.PIPE);
                break;
            case ' ':
            case '':
            case '\r':
            case '\t':
                // Ignore whitespace.                      
                break;
            case '\\':
                if (!match('\n'))
                    throw new Error('Unexpected character "\\"');
                next();
                line++;
                break;
            case '\n':
                line++;
                if (brackets.length) break;
                let n = 0;
                while (match(' ')) n++;
                if (n % indentLen != 0)
                    throw new Error('Bad indentation');
                if (n > currentLevel) {
                    if (n != currentLevel + indentLen)
                        throw new Error('Bad Indentation.');
                    currentLevel = n;
                    addToken(Token.INDENT);
                    levels.push(currentLevel);
                } else if (n < currentLevel) {
                    if (n != currentLevel - indentLen)
                        throw new Error('Bad Indentation');
                    addToken(Token.DEDENT);
                    currentLevel = levels.pop();
                }
                break;
            case '"':
                getString();
                break;
            default:
                if (isDigit(c)) {
                    getNum();
                } else if (isAlpha(c)) {
                    getIdentifier();
                } else {
                    throw new Error('Unexpected character ' + c + ' at line ' + line);
                }
                break;
        }

    }

    while (!eof()) {
        start = current;
        let c = next();
        scanToken(c);
    }

    tokens.push({
        type: Token.EOF,
        string: ""
    });

    return tokens;
}