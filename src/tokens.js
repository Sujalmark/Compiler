"use strict";

/* Everything that describes the tokens of the language. */

const TokenType = Object.freeze({
  ID: "ID",
  INT: "INT",
  REAL: "REAL",
  KEYWORD: "KEYWORD",
  ASSIGN: "ASSIGN",   // :=
  COLON: "COLON",     // :
  SEMI: "SEMI",       // ;
  COMMA: "COMMA",     // ,
  PLUS: "PLUS",
  MINUS: "MINUS",
  STAR: "STAR",
  SLASH: "SLASH",
  CARET: "CARET",     // ^
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  EOF: "EOF",         // end of the program text
});

// Reserved words: these spellings cannot be used as variable names.
const KEYWORDS = new Set(["integer", "real"]);

// Characters that are a complete token on their own (DFA state q7).
// The en dash is accepted as minus because the assignment text uses it.
const SINGLE_CHAR_TOKENS = new Map([
  ["+", TokenType.PLUS],
  ["-", TokenType.MINUS],
  ["\u2013", TokenType.MINUS],
  ["*", TokenType.STAR],
  ["/", TokenType.SLASH],
  ["^", TokenType.CARET],
  ["(", TokenType.LPAREN],
  [")", TokenType.RPAREN],
  [";", TokenType.SEMI],
  [",", TokenType.COMMA],
]);

function createToken(type, lexeme, line, col) {
  return { type, lexeme, line, col };
}

module.exports = { TokenType, KEYWORDS, SINGLE_CHAR_TOKENS, createToken };
