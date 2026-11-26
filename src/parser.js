"use strict";

/* PHASE 2: SYNTAX ANALYZER (recursive descent)
 *
 * One method per grammar rule. Each method reads the tokens of its rule and
 * calls the methods of the rules inside it. At the first token that does not
 * fit, it throws a syntax error with the line and column.
 *
 *   Program     -> Statement*
 *   Statement   -> Declaration | Assignment
 *   Declaration -> IdList ":" Type ";"
 *   IdList      -> ID ( "," ID )*
 *   Type        -> "integer" | "real"
 *   Assignment  -> ID ":=" Expr ";"
 *   Expr        -> Term   ( ("+" | "-") Term   )*    left-associative
 *   Term        -> Factor ( ("*" | "/") Factor )*    left-associative
 *   Factor      -> Base ( "^" Factor )?              right-associative
 *   Base        -> ID | INT | REAL | "(" Expr ")"
 */

const { TokenType } = require("./tokens");
const { syntaxError } = require("./errors");

const OPERAND_TYPES = [TokenType.ID, TokenType.INT, TokenType.REAL];
const ADDITIVE_OPERATORS = [TokenType.PLUS, TokenType.MINUS];
const MULTIPLICATIVE_OPERATORS = [TokenType.STAR, TokenType.SLASH];

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  // ---- token helpers -------------------------------------------------------

  get current() {
    return this.tokens[this.position];
  }

  // The token after the current one (never goes past the EOF token).
  get lookahead() {
    return this.tokens[Math.min(this.position + 1, this.tokens.length - 1)];
  }

  advance() {
    return this.tokens[this.position++];
  }

  check(...types) {
    return types.includes(this.current.type);
  }

  error(message) {
    return syntaxError(message, this.current);
  }

  expect(type, description) {
    if (!this.check(type)) {
      throw this.error(`expected ${description} but found '${this.current.lexeme}'`);
    }
    return this.advance();
  }

  expectVariableName() {
    if (this.check(TokenType.KEYWORD)) {
      throw this.error(
        `reserved word '${this.current.lexeme}' cannot be used as a variable name`);
    }
    return this.expect(TokenType.ID, "a variable name");
  }

  // "name :=" means assignment. Both statements start with a name, so one
  // token of lookahead is enough to decide.
  startsAssignment() {
    return this.check(TokenType.ID, TokenType.KEYWORD)
        && this.lookahead.type === TokenType.ASSIGN;
  }

  // ---- statements ----------------------------------------------------------

  // Program -> Statement*
  parseProgram() {
    while (!this.check(TokenType.EOF)) {
      this.parseStatement();
    }
  }

  // Statement -> Declaration | Assignment
  parseStatement() {
    if (this.startsAssignment()) {
      this.parseAssignment();
    } else if (this.check(TokenType.KEYWORD)) {
      throw this.error(
        `statement cannot begin with reserved word '${this.current.lexeme}'`);
    } else {
      this.parseDeclaration();
    }
  }

  // Declaration -> IdList ":" Type ";"
  parseDeclaration() {
    this.parseIdList();
    this.expect(TokenType.COLON, "':' after variable list");
    this.parseType();
    this.expect(TokenType.SEMI, "';' at end of declaration");
  }

  // IdList -> ID ( "," ID )*
  parseIdList() {
    this.expectVariableName();
    while (this.check(TokenType.COMMA)) {
      this.advance();
      this.expectVariableName();
    }
  }

  // Type -> "integer" | "real"   (the only two keywords)
  parseType() {
    if (!this.check(TokenType.KEYWORD)) {
      throw this.error(
        `expected type 'integer' or 'real' but found '${this.current.lexeme}'`);
    }
    this.advance();
  }

  // Assignment -> ID ":=" Expr ";"
  parseAssignment() {
    this.expectVariableName();
    this.expect(TokenType.ASSIGN, "':='");
    this.parseExpr();
    this.expect(TokenType.SEMI, "';' at end of assignment");
  }

  // ---- expressions: one method per precedence level ------------------------

  // Expr -> Term ( ("+" | "-") Term )*
  // The loop makes + and - left-associative: a - b - c = (a - b) - c
  parseExpr() {
    this.parseTerm();
    while (this.check(...ADDITIVE_OPERATORS)) {
      this.advance();
      this.parseTerm();
    }
  }

  // Term -> Factor ( ("*" | "/") Factor )*
  parseTerm() {
    this.parseFactor();
    while (this.check(...MULTIPLICATIVE_OPERATORS)) {
      this.advance();
      this.parseFactor();
    }
  }

  // Factor -> Base ( "^" Factor )?
  // Calling parseFactor again on the right makes ^ right-associative:
  // a ^ b ^ c = a ^ (b ^ c)
  parseFactor() {
    this.parseBase();
    if (this.check(TokenType.CARET)) {
      this.advance();
      this.parseFactor();
    }
  }

  // Base -> ID | INT | REAL | "(" Expr ")"
  parseBase() {
    if (this.check(...OPERAND_TYPES)) {
      this.advance();
    } else if (this.check(TokenType.LPAREN)) {
      this.parseParenthesizedExpr();
    } else if (this.check(TokenType.KEYWORD)) {
      throw this.error(
        `reserved word '${this.current.lexeme}' cannot be used as a variable`);
    } else {
      throw this.error(
        `expected a variable, number or '(' but found '${this.current.lexeme}'`);
    }
  }

  // "(" Expr ")": what is inside restarts at the loosest level, so
  // parentheses have the highest precedence.
  parseParenthesizedExpr() {
    this.advance();
    this.parseExpr();
    this.expect(TokenType.RPAREN, "')'");
  }
}

module.exports = { Parser };
