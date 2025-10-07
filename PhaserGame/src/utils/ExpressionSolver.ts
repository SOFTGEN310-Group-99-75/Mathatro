import { evaluateExpression } from './ExpressionEvaluator';
import { checkObjective } from './ObjectiveChecker';

export interface SolveCheckResult {
  solvable: boolean;
  expression?: string;
  value?: number;
}

/** Generate possible concatenated numbers from available single digits */
function generateConcatenatedNumbers(numbers: string[]): number[] {
  const singleDigits = numbers.filter(n => n.length === 1);
  const concatenated: number[] = [];
  
  // Try all pairs of single digits for 2-digit concatenations
  for (let i = 0; i < singleDigits.length; i++) {
    for (let j = 0; j < singleDigits.length; j++) {
      if (i !== j) { // Don't use the same digit twice
        const concat = singleDigits[i] + singleDigits[j];
        const value = parseInt(concat, 10);
        if (!concatenated.includes(value)) {
          concatenated.push(value);
        }
      }
    }
  }
  
  return concatenated;
}

/** Find a concatenation expression that produces the target value */
function findConcatenationForTarget(numbers: string[], target: number): { expression: string } | null {
  const singleDigits = numbers.filter(n => n.length === 1);
  const targetStr = target.toString();
  
  // Simple case: check if we can form the target by concatenating 2 digits
  if (targetStr.length === 2) {
    const firstDigit = targetStr[0];
    const secondDigit = targetStr[1];
    
    const hasFirst = singleDigits.includes(firstDigit);
    const hasSecond = singleDigits.includes(secondDigit);
    
    if (hasFirst && hasSecond) {
      return { expression: targetStr };
    }
  }
  
  return null;
}

/**
 * Brute-force enumerates possible linear expressions from the provided hand tokens
 * (numbers & operators) to determine if any satisfy the objective.
 * Tokens can be used at most once. Expressions are formed as n op n op n ...
 * Now supports number concatenation where adjacent digits can form multi-digit numbers.
 */
export function isObjectiveSolvable(hand: string[], objective: string, options: { maxNumbers?: number } = {}): SolveCheckResult { // NOSONAR
  const numbers = hand.filter(t => /^\d+$/.test(t));
  const operators = hand.filter(t => /^[+\-*/^]$/.test(t));
  if (numbers.length === 0) return { solvable: false };

  // With 3 numbers max, expression tokens <= 5 (n op n op n). Reserve 6th slot if UI shows '=' or placeholder.
  const maxNumbers = Math.min(options.maxNumbers ?? 3, numbers.length);

  // --- Fast heuristic passes for single-number satisfaction ---
  const directNumberValues = numbers.map(n => parseInt(n, 10));
  
  // Also check concatenated numbers from single digits
  const concatenatedNumbers = generateConcatenatedNumbers(numbers);
  const allPossibleNumbers = [...directNumberValues, ...concatenatedNumbers];
  
  const objectiveNum = (prefix: string) => parseInt(objective.split(" ")[2]);

  function matchEqual(): SolveCheckResult | null {
    if (!objective.startsWith("Equal to")) return null;
    const target = objectiveNum("Equal to");
    
    // Check direct numbers first
    if (directNumberValues.includes(target)) {
      return { solvable: true, expression: String(target), value: target };
    }
    
    // Check concatenated numbers
    const concatResult = findConcatenationForTarget(numbers, target);
    if (concatResult) {
      return { solvable: true, expression: concatResult.expression, value: target };
    }
    
    return null;
  }
  function matchParity(): SolveCheckResult | null {
    if (objective === "Even number") {
      // Check direct numbers first
      const ev = directNumberValues.find(v => v % 2 === 0);
      if (ev !== undefined) {
        return { solvable: true, expression: String(ev), value: ev };
      }
      
      // Check concatenated numbers
      const evConcat = concatenatedNumbers.find(v => v % 2 === 0);
      if (evConcat !== undefined) {
        const concatResult = findConcatenationForTarget(numbers, evConcat);
        if (concatResult) {
          return { solvable: true, expression: concatResult.expression, value: evConcat };
        }
      }
      return null;
    }
    
    if (objective === "Odd number") {
      // Check direct numbers first
      const od = directNumberValues.find(v => Math.abs(v % 2) === 1);
      if (od !== undefined) {
        return { solvable: true, expression: String(od), value: od };
      }
      
      // Check concatenated numbers
      const odConcat = concatenatedNumbers.find(v => Math.abs(v % 2) === 1);
      if (odConcat !== undefined) {
        const concatResult = findConcatenationForTarget(numbers, odConcat);
        if (concatResult) {
          return { solvable: true, expression: concatResult.expression, value: odConcat };
        }
      }
      return null;
    }
    return null;
  }
  function matchPrime(): SolveCheckResult | null {
    if (objective !== "Prime number") return null;
    
    // Check direct numbers first
    const primes = directNumberValues.filter(v => v >= 2 && isPrimeFast(v));
    if (primes.length) {
      return { solvable: true, expression: String(primes[0]), value: primes[0] };
    }
    
    // Check concatenated numbers
    const concatPrimes = concatenatedNumbers.filter(v => v >= 2 && isPrimeFast(v));
    if (concatPrimes.length) {
      const concatResult = findConcatenationForTarget(numbers, concatPrimes[0]);
      if (concatResult) {
        return { solvable: true, expression: concatResult.expression, value: concatPrimes[0] };
      }
    }
    
    return null;
  }
  function matchDivisible(): SolveCheckResult | null {
    if (!objective.startsWith("Divisible by")) return null;
    const d = objectiveNum("Divisible by");
    
    // Check direct numbers first
    const hit = directNumberValues.find(v => v % d === 0);
    if (hit !== undefined) {
      return { solvable: true, expression: String(hit), value: hit };
    }
    
    // Check concatenated numbers
    const concatHit = concatenatedNumbers.find(v => v % d === 0);
    if (concatHit !== undefined) {
      const concatResult = findConcatenationForTarget(numbers, concatHit);
      if (concatResult) {
        return { solvable: true, expression: concatResult.expression, value: concatHit };
      }
    }
    
    return null;
  }
  function matchGreaterLess(): SolveCheckResult | null {
    if (objective.startsWith("Greater than")) {
      const t = objectiveNum("Greater than");
      
      // Check direct numbers first
      const hit = directNumberValues.find(v => v > t);
      if (hit !== undefined) {
        return { solvable: true, expression: String(hit), value: hit };
      }
      
      // Check concatenated numbers
      const concatHit = concatenatedNumbers.find(v => v > t);
      if (concatHit !== undefined) {
        const concatResult = findConcatenationForTarget(numbers, concatHit);
        if (concatResult) {
          return { solvable: true, expression: concatResult.expression, value: concatHit };
        }
      }
    }
    
    if (objective.startsWith("Less than")) {
      const t = objectiveNum("Less than");
      
      // Check direct numbers first
      const hit = directNumberValues.find(v => v < t);
      if (hit !== undefined) {
        return { solvable: true, expression: String(hit), value: hit };
      }
      
      // Check concatenated numbers
      const concatHit = concatenatedNumbers.find(v => v < t);
      if (concatHit !== undefined) {
        const concatResult = findConcatenationForTarget(numbers, concatHit);
        if (concatResult) {
          return { solvable: true, expression: concatResult.expression, value: concatHit };
        }
      }
    }
    
    return null;
  }
  function matchPower(): SolveCheckResult | null {
    if (!objective.startsWith("Power of")) return null;
    const base = objectiveNum("Power of");
    
    // Check direct numbers first
    const hit = directNumberValues.find(v => isPowerOfFast(base, v));
    if (hit !== undefined) {
      return { solvable: true, expression: String(hit), value: hit };
    }
    
    // Check concatenated numbers
    const concatHit = concatenatedNumbers.find(v => isPowerOfFast(base, v));
    if (concatHit !== undefined) {
      const concatResult = findConcatenationForTarget(numbers, concatHit);
      if (concatResult) {
        return { solvable: true, expression: concatResult.expression, value: concatHit };
      }
    }
    
    return null;
  }
  function matchFactor(): SolveCheckResult | null {
    if (!objective.startsWith("Factor of")) return null;
    const target = objectiveNum("Factor of");
    
    // Check direct numbers first
    const hit = directNumberValues.find(v => v !== 0 && target % v === 0);
    if (hit !== undefined) {
      return { solvable: true, expression: String(hit), value: hit };
    }
    
    // Check concatenated numbers
    const concatHit = concatenatedNumbers.find(v => v !== 0 && target % v === 0);
    if (concatHit !== undefined) {
      const concatResult = findConcatenationForTarget(numbers, concatHit);
      if (concatResult) {
        return { solvable: true, expression: concatResult.expression, value: concatHit };
      }
    }
    
    return null;
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

  function collectConcatenatedNumberPermutations(k: number): string[][] {
    const results: string[][] = [];
    const singleDigits = numbers.filter(n => n.length === 1);
    
    // Generate permutations that include concatenated numbers
    function generateConcatPermutations(targetCount: number): string[][] {
      const perms: string[][] = [];
      
      // Simple case: concatenate 2 single digits to form 1 number, then use other single digits
      if (targetCount >= 1 && singleDigits.length >= 2) {
        for (let i = 0; i < singleDigits.length; i++) {
          for (let j = 0; j < singleDigits.length; j++) {
            if (i !== j) {
              const concatenated = singleDigits[i] + singleDigits[j];
              const remaining = singleDigits.filter((_, idx) => idx !== i && idx !== j);
              
              // Create permutation starting with concatenated number
              const perm = [concatenated];
              
              // Add remaining single digits up to target count
              for (let r = 0; r < Math.min(targetCount - 1, remaining.length); r++) {
                perm.push(remaining[r]);
              }
              
              if (perm.length === targetCount) {
                perms.push(perm);
              }
            }
          }
        }
      }
      
      return perms;
    }
    
    return generateConcatPermutations(k);
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
    // First try regular number permutations
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
    
    // Also try concatenated number permutations
    const concatPerms = collectConcatenatedNumberPermutations(k);
    for (const numSeq of concatPerms) {
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

        // Skip invalid patterns
        if (/\/\s*0(\s|$)/.test(exprKey)) continue;

        const value = evaluateExpression(tokens);
        if (!Number.isFinite(value)) continue;
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
