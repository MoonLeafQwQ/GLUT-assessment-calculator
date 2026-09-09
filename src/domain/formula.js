// domain/formula.js: safe formula parser/evaluator with whitelisted variables.
const { roundTo } = require("./rounding");

const ALLOWED_VAR_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function tokenize(input) {
  if (typeof input !== "string") {
    throw new Error("formula: input must be a string");
  }
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: ch });
      i += 1;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%") {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      let j = i + 1;
      while (j < input.length && ((input[j] >= "0" && input[j] <= "9") || input[j] === ".")) {
        j += 1;
      }
      const numStr = input.slice(i, j);
      const n = Number(numStr);
      if (!Number.isFinite(n)) {
        throw new Error("formula: invalid number '" + numStr + "'");
      }
      tokens.push({ type: "num", value: n });
      i = j;
      continue;
    }
    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z") || ch === "_") {
      let j = i + 1;
      while (
        j < input.length &&
        ((input[j] >= "A" && input[j] <= "Z") ||
          (input[j] >= "a" && input[j] <= "z") ||
          (input[j] >= "0" && input[j] <= "9") ||
          input[j] === "_")
      ) {
        j += 1;
      }
      tokens.push({ type: "var", name: input.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error("formula: unexpected character '" + ch + "' at position " + i);
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  function peek() { return tokens[pos]; }
  function eat(type, value) {
    const t = tokens[pos];
    if (!t) throw new Error("formula: unexpected end of expression");
    if (t.type !== type) throw new Error("formula: expected " + type + " got " + t.type);
    if (value !== undefined && t.value !== value) {
      throw new Error("formula: expected " + value + " got " + t.value);
    }
    pos += 1;
    return t;
  }
  function parseExpr() { return parseAddSub(); }
  function parseAddSub() {
    let left = parseMulDiv();
    while (peek() && peek().type === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = eat("op").value;
      const right = parseMulDiv();
      left = { type: "binary", op, left, right };
    }
    return left;
  }
  function parseMulDiv() {
    let left = parseUnary();
    while (peek() && peek().type === "op" && (peek().value === "*" || peek().value === "/")) {
      const op = eat("op").value;
      const right = parseUnary();
      left = { type: "binary", op, left, right };
    }
    return left;
  }
  function parseUnary() {
    if (peek() && peek().type === "op" && peek().value === "-") {
      eat("op");
      const operand = parseUnary();
      return { type: "unary", op: "-", operand };
    }
    if (peek() && peek().type === "op" && peek().value === "+") {
      eat("op");
      return parseUnary();
    }
    return parsePostPercent();
  }
  function parsePostPercent() {
    const node = parseAtom();
    if (peek() && peek().type === "op" && peek().value === "%") {
      eat("op");
      return { type: "percent", operand: node };
    }
    return node;
  }
  function parseAtom() {
    const t = peek();
    if (!t) throw new Error("formula: unexpected end of expression");
    if (t.type === "num") { eat("num"); return { type: "num", value: t.value }; }
    if (t.type === "var") { eat("var"); return { type: "var", name: t.name }; }
    if (t.type === "(") {
      eat("(");
      const expr = parseExpr();
      eat(")");
      return expr;
    }
    throw new Error("formula: unexpected token " + t.type);
  }
  const ast = parseExpr();
  if (pos !== tokens.length) {
    throw new Error("formula: trailing tokens after expression");
  }
  return ast;
}

function evaluateAst(ast, vars) {
  if (!ast || typeof ast !== "object") {
    throw new Error("formula: invalid AST");
  }
  switch (ast.type) {
    case "num":
      return ast.value;
    case "var": {
      if (typeof vars[ast.name] !== "number" || !Number.isFinite(vars[ast.name])) {
        throw new Error("formula: missing or non-numeric variable '" + ast.name + "'");
      }
      return vars[ast.name];
    }
    case "unary": {
      const v = evaluateAst(ast.operand, vars);
      if (ast.op === "-") return -v;
      throw new Error("formula: unknown unary op '" + ast.op + "'");
    }
    case "binary": {
      const l = evaluateAst(ast.left, vars);
      const r = evaluateAst(ast.right, vars);
      if (ast.op === "+") return l + r;
      if (ast.op === "-") return l - r;
      if (ast.op === "*") return l * r;
      if (ast.op === "/") {
        if (r === 0) throw new Error("formula: division by zero");
        return l / r;
      }
      throw new Error("formula: unknown binary op '" + ast.op + "'");
    }
    case "percent":
      return evaluateAst(ast.operand, vars) / 100;
    default:
      throw new Error("formula: unknown node type '" + ast.type + "'");
  }
}

function validateVariables(vars, whitelist) {
  if (!vars || typeof vars !== "object") {
    throw new Error("formula: variables must be an object");
  }
  for (const k of Object.keys(vars)) {
    if (!ALLOWED_VAR_RE.test(k)) {
      throw new Error("formula: invalid variable name '" + k + "'");
    }
  }
  if (Array.isArray(whitelist) && whitelist.length > 0) {
    const set = new Set(whitelist);
    for (const k of Object.keys(vars)) {
      if (!set.has(k)) {
        throw new Error("formula: variable '" + k + "' is not in whitelist");
      }
    }
  }
}

function compile(expression, whitelist) {
  const tokens = tokenize(expression);
  const ast = parse(tokens);
  if (Array.isArray(whitelist) && whitelist.length > 0) {
    const used = collectVariables(ast);
    for (const name of used) {
      if (!whitelist.includes(name)) {
        throw new Error("formula: variable '" + name + "' is not in whitelist");
      }
    }
  }
  return function run(vars) {
    validateVariables(vars, whitelist);
    const raw = evaluateAst(ast, vars);
    return roundTo(raw, 4);
  };
}

function collectVariables(ast, out) {
  const acc = out || new Set();
  if (!ast || typeof ast !== "object") return acc;
  if (ast.type === "var") acc.add(ast.name);
  if (ast.left) collectVariables(ast.left, acc);
  if (ast.right) collectVariables(ast.right, acc);
  if (ast.operand) collectVariables(ast.operand, acc);
  return acc;
}

function preview(expression, vars, whitelist) {
  try {
    const tokens = tokenize(expression);
    const ast = parse(tokens);
    validateVariables(vars, whitelist);
    const raw = evaluateAst(ast, vars);
    return { ok: true, value: roundTo(raw, 4), variables: Array.from(collectVariables(ast)) };
  } catch (err) {
    return { ok: false, error: err.message, variables: [] };
  }
}

module.exports = {
  ALLOWED_VAR_RE,
  tokenize,
  parse,
  evaluateAst,
  compile,
  preview,
  collectVariables,
};
