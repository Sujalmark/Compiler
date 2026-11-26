"use strict";

/* Automatic tests. Run with:  node --test */

const test = require("node:test");
const assert = require("node:assert");
const { compile, SUCCESS_MESSAGE } = require("../src/compile");

function assertCompiles(source) {
  assert.strictEqual(compile(source), SUCCESS_MESSAGE);
}

function assertFails(source, expectedMessage) {
  assert.strictEqual(compile(source), expectedMessage);
}

test("declarations are accepted", () => {
  assertCompiles("a: integer;\nb, c: integer;\ni, j, k: real;");
});

test("valid expressions are accepted", () => {
  assertCompiles("a := 3 + b * (b - 12) ^ 7;");
  assertCompiles("i := 123;");
  assertCompiles("x := (a + b) / 2.5;");
  assertCompiles("y := a ^ b ^ 2;");
  assertCompiles("z := ((1 + 2) * (3 - 4)) / _k9;");
});

test("the en dash is accepted as minus", () => {
  assertCompiles("a := 3 + b * (b \u2013 12) ^ 7;");
});

test("operator with no operand", () => {
  assertFails("a := 3 + * 4;",
    "Syntax error (line 1, col 10): expected a variable, number or '(' but found '*'");
});

test("missing closing parenthesis", () => {
  assertFails("a := (3 + 4;",
    "Syntax error (line 1, col 12): expected ')' but found ';'");
});

test("missing semicolon is reported on the next token", () => {
  assertFails("a := 3 + 4\nb := 5;",
    "Syntax error (line 2, col 1): expected ';' at end of assignment but found 'b'");
});

test("name starting with a digit", () => {
  assertFails("9abc := 5;",
    "Lexical error (line 1, col 1): invalid name starting with '9a': " +
    "a variable name cannot start with a digit");
});

test("reserved word used as a name", () => {
  assertFails("integer := 4;",
    "Syntax error (line 1, col 1): reserved word 'integer' cannot be used as a variable name");
});

test("malformed real number", () => {
  assertFails("a := 3.;",
    "Lexical error (line 1, col 6): malformed real number (digit expected after '.')");
});

test("illegal character", () => {
  assertFails("a := 3 # 4;", "Lexical error (line 1, col 8): illegal character '#'");
});

test("unknown type in a declaration", () => {
  assertFails("a: float;",
    "Syntax error (line 1, col 4): expected type 'integer' or 'real' but found 'float'");
});
