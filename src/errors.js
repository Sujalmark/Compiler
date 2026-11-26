"use strict";

/* Errors caused by the user's program (not bugs in this compiler).
 * Every message says WHERE the problem is: line and column. */

class CompileError extends Error {}

function describeLocation(line, column) {
  return `line ${line}, col ${column}`;
}

function lexicalError(message, line, column) {
  return new CompileError(`Lexical error (${describeLocation(line, column)}): ${message}`);
}

function syntaxError(message, token) {
  return new CompileError(
    `Syntax error (${describeLocation(token.line, token.col)}): ${message}`);
}

module.exports = { CompileError, lexicalError, syntaxError };
