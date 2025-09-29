export function evaluateExpression(cards: string[]): number {
  const sanitized = cards
    .filter(c => c !== "?")
    .map(c => {
      if (c === "x") return "*";
      if (c === "÷") return "/";
      return c;
    });

  const expr = sanitized.join(" ");
  console.log("Sanitized Expression:", expr);

  try {
    //  Safe evaluation: only numbers and + - * / ^ allowed
    if (!/^[0-9+\-*/^().\s]+$/.test(expr)) {
      return NaN; // reject invalid tokens
    }
    return Function(`"use strict"; return (${expr})`)(); // <-- still flagged
  } catch {
    return NaN;
  }
}
