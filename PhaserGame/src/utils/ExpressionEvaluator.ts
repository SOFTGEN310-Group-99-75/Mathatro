// utils/ExpressionEvaluator.ts
export function evaluateExpression(cards: string[]): number {
  // Clean up the card labels
  const sanitized = cards
    .filter(c => c !== "?")          // remove placeholders
    .map(c => {
      if (c === "x") return "*";     // fix multiplication
      if (c === "÷") return "/";     // optional if you use ÷
      return c;
    });

  const expr = sanitized.join(" ");
  console.log("Sanitized Expression:", expr);

  try {
    // Prototype: use eval (later replace with parser for safety)
    return eval(expr);
  } catch {
    return NaN;
  }
}
