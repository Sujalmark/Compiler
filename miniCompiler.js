"use strict";

/* Mini compiler: command-line entry point.
 *
 *   node miniCompiler.js              runs every file in examples/
 *   node miniCompiler.js prog.txt     checks your own program file
 */

const fs = require("fs");
const path = require("path");
const { compile } = require("./src/compile");

const EXAMPLES_DIR = path.join(__dirname, "examples");

function checkFile(filePath) {
  return compile(fs.readFileSync(filePath, "utf8"));
}

function runAllExamples() {
  for (const fileName of fs.readdirSync(EXAMPLES_DIR).sort()) {
    const filePath = path.join(EXAMPLES_DIR, fileName);
    const source = fs.readFileSync(filePath, "utf8").trimEnd();
    console.log(`[${fileName}]\n${source}\n -> ${checkFile(filePath)}\n`);
  }
}

function main(args) {
  if (args.length > 0) console.log(checkFile(args[0]));
  else runAllExamples();
}

main(process.argv.slice(2));
