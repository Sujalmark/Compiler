"use strict";

/* Walks through the program text one character at a time and keeps track of
 * the current line and column (both start at 1). */

class SourceCursor {
  constructor(text) {
    this.text = text;
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  // Look at a character without consuming it. Returns "" past the end.
  peek(offset = 0) {
    return this.text[this.index + offset] || "";
  }

  isAtEnd() {
    return this.index >= this.text.length;
  }

  advance() {
    this.index++;
    this.column++;
  }

  advanceToNextLine() {
    this.index++;
    this.line++;
    this.column = 1;
  }

  advanceWhile(predicate) {
    while (!this.isAtEnd() && predicate(this.peek())) this.advance();
  }

  // Remember where a token starts, so it can be reported later.
  mark() {
    return { index: this.index, line: this.line, column: this.column };
  }

  textFrom(startIndex) {
    return this.text.slice(startIndex, this.index);
  }
}

module.exports = { SourceCursor };
