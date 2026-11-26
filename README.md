# Mini Compiler (COSC 3127, Assignment #1)

A lexical analyzer (DFA) and a syntax analyzer (recursive descent parser) for a
small language: `integer` / `real` declarations, `:=` assignments, and the
operators `+ - * / ^` with parentheses.

The compiler does not calculate anything. It prints `Compilation successful.`
or an error message with the line and column.

## Folder layout

```
mini-compiler/
  miniCompiler.js        command-line entry point
  src/
    tokens.js            token types, keywords, single-character tokens
    charClasses.js       isLetter, isDigit, ...
    sourceCursor.js      reads text, tracks line and column
    lexer.js             phase 1: text -> tokens (the DFA)
    parser.js            phase 2: tokens -> syntax check (recursive descent)
    errors.js            error type and error messages
    compile.js           runs both phases
  examples/              1 declaration file, 5 valid, 5 invalid programs
  tests/compiler.test.js automatic tests
```

## How to run (needs Node.js 18 or newer)

```
node miniCompiler.js                  run every file in examples/
node miniCompiler.js prog.txt         check your own file
node --test                    run the automatic tests
```

## Operator precedence (loosest to tightest)

1. `+` `-` (left-associative)
2. `*` `/` (left-associative)
3. `^` (right-associative: `a ^ b ^ c` = `a ^ (b ^ c)`)
4. parentheses
