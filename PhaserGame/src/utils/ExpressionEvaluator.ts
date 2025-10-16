import { Parser } from "expr-eval";

// Evaluate math expression from card array
export function evaluateExpression(cards: string[]): number {
  // Concatenate adjacent numbers, evaluate normally when operators are present
  if (!cards || cards.length === 0) return NaN;
  const processed: string[] = [];
  let i = 0;
  while (i < cards.length) {
    if (/^\d+$/.test(cards[i])) {
      let numStr = cards[i];
      // Concatenate subsequent numbers, skipping over any '?' placeholders between digits
      let j = i + 1;
      let lastDigitIndex = i;
      while (j < cards.length) {
        const token = cards[j];
        if (token === "?") {
          j++;
          continue; // ignore placeholders between digits
        }
        if (/^\d+$/.test(token)) {
          numStr += token;
          lastDigitIndex = j;
          j++;
          continue;
        }
        break; // stop when encountering a non-digit, non-placeholder token
      }
      processed.push(numStr);
      // Advance i to the last digit we consumed (could have skipped over '?'s)
      i = lastDigitIndex;
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
