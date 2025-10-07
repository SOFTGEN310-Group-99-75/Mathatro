import { Parser } from "expr-eval";

export function evaluateExpression(cards: string[]): number {
  // Concatenate adjacent numbers, evaluate normally when operators are present
  if (!cards || cards.length === 0) return NaN;
  const processed: string[] = [];
  let i = 0;
  while (i < cards.length) {
    if (/^\d+$/.test(cards[i])) {
      let numStr = cards[i];
      // Concatenate all subsequent adjacent numbers
      while (i + 1 < cards.length && /^\d+$/.test(cards[i + 1])) {
        numStr += cards[i + 1];
        i++;
      }
      processed.push(numStr);
    } else if (cards[i] === "x") {
      processed.push("*");
    } else if (cards[i] === "÷") {
      processed.push("/");
    } else if (cards[i] !== "?") {
      processed.push(cards[i]);
    }
    i++;
  }
  const expr = processed.join(" ").trim();
  if (!expr) return NaN;
  try {
    const parser = new Parser({ operators: { add: true, subtract: true, multiply: true, divide: true, power: true }});
    const value = parser.evaluate(expr);
    if (typeof value !== "number" || !isFinite(value)) return NaN;
    return value;
  } catch {
    return NaN;
  }
}
