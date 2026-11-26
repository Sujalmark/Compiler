"use strict";

/* Character classes used by the lexer. */

const isLetter = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
const isDigit = (c) => c >= "0" && c <= "9";
const isLetterOrDigit = (c) => isLetter(c) || isDigit(c);
const isBlank = (c) => c === " " || c === "\t" || c === "\r";

module.exports = { isLetter, isDigit, isLetterOrDigit, isBlank };
