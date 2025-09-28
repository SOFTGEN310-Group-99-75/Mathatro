
export function evaluateExpression(cards: string[]): number {
  // Clean up the card labels
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

    return eval(expr);
  } catch {
    return NaN;
  }
}
