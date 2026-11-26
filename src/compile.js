"use strict";

/* Runs both phases on a program and returns a one-line result message. */

const { tokenize } = require("./lexer");
const { Parser } = require("./parser");
const { CompileError } = require("./errors");

const SUCCESS_MESSAGE = "Compilation successful.";

function compile(sourceText) {
  try {
    const tokens = tokenize(sourceText);   // phase 1
    new Parser(tokens).parseProgram();     // phase 2
    return SUCCESS_MESSAGE;
  } catch (error) {
    if (error instanceof CompileError) return error.message;  // bad user program
    throw error;                                              // a real bug
  }
}

module.exports = { compile, SUCCESS_MESSAGE };
