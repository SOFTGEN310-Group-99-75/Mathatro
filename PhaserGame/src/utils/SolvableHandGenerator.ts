import { DIFFICULTY_CONFIG, DifficultyMode, GAME_CONFIG, PRIME_NUMBERS } from '../config/GameConstants';
import { evaluateExpression } from './ExpressionEvaluator';

/** Result structure for the solvable hand generator */
export interface SolvableRound {
  hand: string[];               // Complete hand (shuffled)
  objective: string;            // Objective satisfied by solution
  solutionExpression: string;   // Expression (tokens joined with spaces) that satisfies objective
  value: number;                // Evaluated value of the solution expression
}

// Objective pools (mirrors existing GenerateObjective intent)
const EASY_OBJECTIVES = ["Equal to", "Odd number", "Even number"] as const;
const MEDIUM_OBJECTIVES = ["Greater than", "Less than", "Divisible by", "Prime number"] as const;
const HARD_OBJECTIVES = ["Power of", "Factor of", "Prime number", "Divisible by"] as const;

/** Utility helpers */
const isPrime = (n: number) => Number.isInteger(n) && n >= 2 && PRIME_NUMBERS.includes(n as any);
const isPowerOf = (base: number, value: number) => {
  if (value < 1 || !Number.isInteger(value)) return false;
  let current = base;
  while (current < value) current *= base;
  return current === value;
};

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

/** Build a random linear (no parentheses) expression tokens */
function generateExpressionTokens(difficulty: DifficultyMode): { tokens: string[]; value: number } | null {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  // Choose number of numeric operands
  const minNums = difficulty === 'easy' ? 2 : 3;
  const maxNums = Math.min(5, 5); // keep within reasonable complexity
  const numCount = randInt(minNums, maxNums);
  const opCount = numCount - 1;

  // Pick numbers
  const numbers: string[] = [];
  for (let i = 0; i < numCount; i++) {
  numbers.push(randInt(cfg.minNumber, cfg.maxNumber).toString());
  }

  // Pick operators (allow repetition within allowed list)
  const operators: string[] = [];
  for (let i = 0; i < opCount; i++) operators.push(sample(cfg.operators));

  // Interleave: n0 op0 n1 op1 n2 ...
  const tokens: string[] = [];
  for (let i = 0; i < numCount; i++) {
    tokens.push(numbers[i]);
    if (i < opCount) tokens.push(operators[i]);
  }

  // Evaluate
  const value = evaluateExpression(tokens);

  if (!Number.isFinite(value)) return null;
  if (difficulty === 'hard') {
    // Hard objectives require integer positive value for available objective types
    if (!Number.isInteger(value) || value <= 0) return null;
  }

  return { tokens, value };
}

/** Helper: collect divisors within configured range */
function collectDivisors(value: number): number[] {
  const divs: number[] = [];
  if (!Number.isInteger(value)) return divs;
  for (let d = GAME_CONFIG.OBJECTIVE.MIN_DIVISOR; d <= GAME_CONFIG.OBJECTIVE.MAX_DIVISOR; d++) {
    // MIN_DIVISOR is > 0 by config, so no zero divisor check needed
    if (value % d === 0) divs.push(d);
  }
  return divs;
}

function pickRandomOrNull(candidates: string[]): string | null {
  return candidates.length ? sample(candidates) : null;
}

function deriveEasyObjective(value: number): string | null {
  const candidates: string[] = [];
  if (Number.isInteger(value)) {
    candidates.push(value % 2 === 0 ? 'Even number' : 'Odd number');
  }
  candidates.push(`Equal to ${value}`);
  return pickRandomOrNull(candidates);
}

function deriveMediumObjective(value: number): string | null {
  const candidates: string[] = [];
  // Greater than X (ensure space below value)
  if (value > GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE + 1) {
    const maxLower = Math.max(GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE, Math.floor(value) - 1);
    const lower = randInt(GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE, maxLower);
    candidates.push(`Greater than ${lower}`);
  }
  // Less than Y (ensure space above value)
  if (value < GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE - 1) {
    const minHigher = Math.ceil(value) + 1;
    if (minHigher <= GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE) {
      const higher = randInt(minHigher, GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE);
      if (higher > value) candidates.push(`Less than ${higher}`);
    }
  }
  // Divisible / Prime
  if (Number.isInteger(value) && Math.abs(value) >= 2) {
    const divs = collectDivisors(value);
    if (divs.length) candidates.push(`Divisible by ${sample(divs)}`);
    if (isPrime(value)) candidates.push('Prime number');
  }
  return pickRandomOrNull(candidates);
}

function deriveHardObjective(value: number): string | null {
  if (!Number.isInteger(value) || value <= 0) return null;
  const candidates: string[] = [];

  // Power of base
  for (let base = GAME_CONFIG.OBJECTIVE.MIN_POWER; base <= GAME_CONFIG.OBJECTIVE.MAX_POWER; base++) {
    if (isPowerOf(base, value)) candidates.push(`Power of ${base}`);
  }

  // Factor of target (value is factor of target)
  if (value >= 1) {
    const maxMultiplier = Math.floor(GAME_CONFIG.OBJECTIVE.MAX_FACTOR / value);
    if (maxMultiplier >= 2) {
      const mult = randInt(2, maxMultiplier);
      const target = value * mult;
      if (target >= GAME_CONFIG.OBJECTIVE.MIN_FACTOR && target <= GAME_CONFIG.OBJECTIVE.MAX_FACTOR) {
        candidates.push(`Factor of ${target}`);
      }
    }
  }

  // Divisible by
  const divs = collectDivisors(value);
  if (divs.length) candidates.push(`Divisible by ${sample(divs)}`);
  if (isPrime(value)) candidates.push('Prime number');
  return pickRandomOrNull(candidates);
}

/** Generate objective string consistent with the value and difficulty (refactored for low complexity) */
function deriveObjective(value: number, difficulty: DifficultyMode): string | null {
  switch (difficulty) {
    case 'easy':
      return deriveEasyObjective(value);
    case 'medium':
      return deriveMediumObjective(value);
    case 'hard':
      return deriveHardObjective(value);
    default:
      return null;
  }
}

/** Fill the remaining hand slots with distractor tokens (numbers & operators) */
function buildHandFromExpression(tokens: string[], difficulty: DifficultyMode): string[] {
  const handSize = GAME_CONFIG.HAND_SLOTS; // 8
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const hand: string[] = [...tokens];

  // Aim for at least 5 numbers total if space
  while (hand.length < handSize && hand.filter(t => /^\d+$/.test(t)).length < 5) {
  hand.push(randInt(cfg.minNumber, cfg.maxNumber).toString());
  }
  // Fill remaining with operators (ensuring at least 3 operators overall if possible)
  while (hand.length < handSize) {
    hand.push(sample(cfg.operators));
  }
  return shuffled(hand);
}

/** Public API: generate a solvable round (expression-first approach) */
export function generateSolvableHandAndObjective(difficulty: DifficultyMode, maxAttempts = 50): SolvableRound {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const expr = generateExpressionTokens(difficulty);
    if (!expr) continue;
    const objective = deriveObjective(expr.value, difficulty);
    if (!objective) continue; // regenerate
    const hand = buildHandFromExpression(expr.tokens, difficulty);
    return {
      hand,
      objective,
      solutionExpression: expr.tokens.join(' '),
      value: expr.value
    };
  }
  // Fallback: trivial easy expression as last resort
  const fallbackValue = 2;
  return {
    hand: ['1', '1', '+', '+', '2', '3', '+', '4'],
    objective: `Equal to ${fallbackValue}`,
    solutionExpression: '1 + 1',
    value: fallbackValue
  };
}
