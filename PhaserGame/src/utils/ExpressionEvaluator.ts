import { Parser } from "expr-eval";

export function evaluateExpression(cards: string[]): number {
  const sanitized = cards
    .filter(c => c !== "?")
    .map(c => (c === "x" ? "*" : c === "÷" ? "/" : c));

  const expr = sanitized.join(" ").trim();
  if (!expr) return NaN;

  try {
    // Parser validates + evaluates without using eval/new Function
    const parser = new Parser({ operators: { add: true, subtract: true, multiply: true, divide: true, power: true }});
    const value = parser.evaluate(expr);
    if (typeof value !== "number" || !isFinite(value)) return NaN;
    return value;
  } catch {
    return NaN;
  }
}
