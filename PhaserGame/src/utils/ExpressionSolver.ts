import { evaluateExpression } from './ExpressionEvaluator';
import { checkObjective } from './ObjectiveChecker';

export interface SolveCheckResult {
  solvable: boolean;
  expression?: string;
  value?: number;
}

/**
 * Brute-force enumerates possible linear expressions from the provided hand tokens
 * (numbers & operators) to determine if any satisfy the objective.
 * Tokens can be used at most once. Expressions are formed as n op n op n ...
 */
export function isObjectiveSolvable(hand: string[], objective: string, options: { maxNumbers?: number } = {}): SolveCheckResult { // NOSONAR
  const numbers = hand.filter(t => /^\d+$/.test(t));
  const operators = hand.filter(t => /^[+\-*/^]$/.test(t));
  if (numbers.length === 0) return { solvable: false };

  // With 3 numbers max, expression tokens <= 5 (n op n op n). Reserve 6th slot if UI shows '=' or placeholder.
  const maxNumbers = Math.min(options.maxNumbers ?? 3, numbers.length);

  // --- Fast heuristic passes for single-number satisfaction ---
  const directNumberValues = numbers.map(n => parseInt(n, 10));
  const objectiveNum = (prefix: string) => parseInt(objective.split(" ")[2]);

  function matchEqual(): SolveCheckResult | null {
    if (!objective.startsWith("Equal to")) return null;
    const target = objectiveNum("Equal to");
    return directNumberValues.includes(target) ? { solvable: true, expression: String(target), value: target } : null;
  }
  function matchParity(): SolveCheckResult | null {
    if (objective === "Even number") {
      const ev = directNumberValues.find(v => v % 2 === 0);
      return ev !== undefined ? { solvable: true, expression: String(ev), value: ev } : null;
    }
    if (objective === "Odd number") {
      const od = directNumberValues.find(v => Math.abs(v % 2) === 1);
      return od !== undefined ? { solvable: true, expression: String(od), value: od } : null;
    }
    return null;
  }
  function matchPrime(): SolveCheckResult | null {
    if (objective !== "Prime number") return null;
    const primes = directNumberValues.filter(v => v >= 2 && isPrimeFast(v));
    return primes.length ? { solvable: true, expression: String(primes[0]), value: primes[0] } : null;
  }
  function matchDivisible(): SolveCheckResult | null {
    if (!objective.startsWith("Divisible by")) return null;
    const d = objectiveNum("Divisible by");
    const hit = directNumberValues.find(v => v % d === 0);
    return hit !== undefined ? { solvable: true, expression: String(hit), value: hit } : null;
  }
  function matchGreaterLess(): SolveCheckResult | null {
    if (objective.startsWith("Greater than")) {
      const t = objectiveNum("Greater than");
      const hit = directNumberValues.find(v => v > t);
      return hit !== undefined ? { solvable: true, expression: String(hit), value: hit } : null;
    }
    if (objective.startsWith("Less than")) {
      const t = objectiveNum("Less than");
      const hit = directNumberValues.find(v => v < t);
      return hit !== undefined ? { solvable: true, expression: String(hit), value: hit } : null;
    }
    return null;
  }
  function matchPower(): SolveCheckResult | null {
    if (!objective.startsWith("Power of")) return null;
    const base = objectiveNum("Power of");
    const hit = directNumberValues.find(v => isPowerOfFast(base, v));
    return hit !== undefined ? { solvable: true, expression: String(hit), value: hit } : null;
  }
  function matchFactor(): SolveCheckResult | null {
    if (!objective.startsWith("Factor of")) return null;
    const target = objectiveNum("Factor of");
    const hit = directNumberValues.find(v => v !== 0 && target % v === 0);
    return hit !== undefined ? { solvable: true, expression: String(hit), value: hit } : null;
  }
  function quickNumberMatch(): SolveCheckResult | null {
    return matchEqual() || matchParity() || matchPrime() || matchDivisible() || matchGreaterLess() || matchPower() || matchFactor() || null;
  }

  const quick = quickNumberMatch();
  if (quick) return quick;

  // Build a multiset count map for operators
  const opCounts: Record<string, number> = {};
  for (const op of operators) opCounts[op] = (opCounts[op] || 0) + 1;

  const usedNum: boolean[] = new Array(numbers.length).fill(false);
  const exprCache = new Set<string>();

  function collectNumberPermutations(k: number): string[][] {
    const results: string[][] = [];
    const acc: string[] = [];
    const usedAtDepth: Set<string>[] = Array.from({ length: k }, () => new Set());
    function backtrack(depth: number) {
      if (depth === k) { results.push(acc.slice()); return; }
      const seen = usedAtDepth[depth];
      for (let i = 0; i < numbers.length; i++) {
        if (usedNum[i]) continue;
        const val = numbers[i];
        if (seen.has(val)) continue;
        seen.add(val);
        usedNum[i] = true;
        acc.push(val);
        backtrack(depth + 1);
        acc.pop();
        usedNum[i] = false;
      }
    }
    backtrack(0);
    return results;
  }

  function collectOperatorSequences(len: number): string[][] {
    const results: string[][] = [];
    const ops = Object.keys(opCounts);
    const counts: Record<string, number> = { ...opCounts };
    const acc: string[] = [];
    function backtrack() {
      if (acc.length === len) { results.push(acc.slice()); return; }
      for (const op of ops) {
        if (counts[op] > 0) {
          counts[op]--;
            acc.push(op);
            backtrack();
            acc.pop();
            counts[op]++;
        }
      }
    }
    backtrack();
    return results;
  }

  for (let k = 1; k <= maxNumbers; k++) {
    const numPerms = collectNumberPermutations(k);
    for (const numSeq of numPerms) {
      const opLen = k - 1;
      const opSeqs = collectOperatorSequences(opLen);
      for (const opSeq of opSeqs) {
        const tokens: string[] = [];
        for (let i = 0; i < numSeq.length; i++) {
          tokens.push(numSeq[i]);
          if (i < opSeq.length) tokens.push(opSeq[i]);
        }
        const exprKey = tokens.join(' ');
        if (exprCache.has(exprKey)) continue;
        exprCache.add(exprKey);

        // Basic invalid pattern skips (removed vulnerable regex to prevent potential ReDoS)
        // Old regex: /[^\d)]\s*[*/^]\s*0(\s|$)/
        const hasZeroOpPattern = (() => {
          for (let i = 0; i < tokens.length - 1; i++) {
            const op = tokens[i];
            if ((op === '*' || op === '/' || op === '^') && tokens[i + 1] === '0') {
              return true;
            }
          }
          return false;
        })();
        if (hasZeroOpPattern) {
          // placeholder for future skip logic (currently no-op)
        }
        // Prevent division by zero evaluation attempts
        if (/\/\s*0(\s|$)/.test(exprKey)) continue;

        const value = evaluateExpression(tokens);
        if (!Number.isFinite(value)) continue;
        // Avoid astronomically large numbers generated by power chains
        if (Math.abs(value) > 1e9) continue;
        if (checkObjective(value, objective)) {
          return { solvable: true, expression: exprKey, value };
        }
      }
    }
  }

  return { solvable: false };
}

// Lightweight prime + power checks (avoid importing larger constants here)
function isPrimeFast(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const r = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= r; i += 2) if (n % i === 0) return false;
  return true;
}

function isPowerOfFast(base: number, value: number): boolean {
  if (base <= 1 || value < 1) return false;
  let cur = base;
  while (cur < value) cur *= base;
  return cur === value;
}
