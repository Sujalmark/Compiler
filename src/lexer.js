"use strict";

/* PHASE 1: LEXICAL ANALYZER
 *
 * Turns program text into a list of tokens. Each scan method follows one path
 * of the DFA diagram:
 *
 *   q0 --letter/_--> q1 (ID or KEYWORD)      loops on letter | digit | _
 *   q0 --digit-----> q2 (INT) --"."--> q3 --digit--> q4 (REAL)
 *   q0 --":"-------> q5 (COLON) --"="--> q6 (ASSIGN)
 *   q0 --+ - * / ^ ( ) ; ,--> q7 (single-character token)
 *   anything else -> ERROR
 */

const { TokenType, KEYWORDS, SINGLE_CHAR_TOKENS, createToken } = require("./tokens");
const { isLetter, isDigit, isLetterOrDigit, isBlank } = require("./charClasses");
const { SourceCursor } = require("./sourceCursor");
const { lexicalError } = require("./errors");

class Lexer {
  constructor(sourceText) {
    this.cursor = new SourceCursor(sourceText);
    this.tokens = [];
  }

  tokenize() {
    while (!this.cursor.isAtEnd()) {
      this.scanNext();
    }
    this.addEndOfFileToken();
    return this.tokens;
  }

  scanNext() {
    const ch = this.cursor.peek();

    if (ch === "\n") this.cursor.advanceToNextLine();
    else if (isBlank(ch)) this.cursor.advance();
    else this.scanToken();
  }

  scanToken() {
    const start = this.cursor.mark();
    const type = this.scanTokenType(start);
    const lexeme = this.cursor.textFrom(start.index);
    this.tokens.push(createToken(type, lexeme, start.line, start.column));
  }

  // DFA state q0: the first character decides which path to follow.
  scanTokenType(start) {
    const ch = this.cursor.peek();

    if (isLetter(ch)) return this.scanWord(start);
    if (isDigit(ch)) return this.scanNumber(start);
    if (ch === ":") return this.scanColonOrAssign();
    if (SINGLE_CHAR_TOKENS.has(ch)) return this.scanSingleChar(ch);

    throw lexicalError(`illegal character '${ch}'`, start.line, start.column);
  }

  // q0 -> q1: letter ( letter | digit )*, then check the reserved-word table.
  scanWord(start) {
    this.cursor.advanceWhile(isLetterOrDigit);
    const word = this.cursor.textFrom(start.index);
    return KEYWORDS.has(word) ? TokenType.KEYWORD : TokenType.ID;
  }

  // q0 -> q2 (INT), or q2 -> q3 -> q4 (REAL): digit+ ( "." digit+ )?
  scanNumber(start) {
    this.cursor.advanceWhile(isDigit);
    const type = this.cursor.peek() === "." ? this.scanFraction(start) : TokenType.INT;
    this.rejectNameStartingWithDigit(start);
    return type;
  }

  // q2 -> q3 -> q4: the "." and the digits after it.
  scanFraction(start) {
    this.cursor.advance();
    if (!isDigit(this.cursor.peek())) {
      throw lexicalError("malformed real number (digit expected after '.')",
                         start.line, start.column);
    }
    this.cursor.advanceWhile(isDigit);
    return TokenType.REAL;
  }

  // A number followed by a letter, like 9abc, is a name that starts with a digit.
  rejectNameStartingWithDigit(start) {
    if (!isLetter(this.cursor.peek())) return;

    const badName = this.cursor.textFrom(start.index) + this.cursor.peek();
    throw lexicalError(
      `invalid name starting with '${badName}': a variable name cannot start with a digit`,
      start.line, start.column);
  }

  // q0 -> q5 (COLON), or q5 -> q6 (ASSIGN).
  scanColonOrAssign() {
    this.cursor.advance();
    if (this.cursor.peek() !== "=") return TokenType.COLON;

    this.cursor.advance();
    return TokenType.ASSIGN;
  }

  // q0 -> q7: + - * / ^ ( ) ; ,
  scanSingleChar(ch) {
    this.cursor.advance();
    return SINGLE_CHAR_TOKENS.get(ch);
  }

  addEndOfFileToken() {
    const { line, column } = this.cursor;
    this.tokens.push(createToken(TokenType.EOF, "<EOF>", line, column));
  }
}

function tokenize(sourceText) {
  return new Lexer(sourceText).tokenize();
}

module.exports = { Lexer, tokenize };
