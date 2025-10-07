import {
    DIFFICULTY_CONFIG,
    DifficultyMode,
    GAME_CONFIG,
    PRIME_NUMBERS,
} from "../config/GameConstants";
import { evaluateExpression } from "./ExpressionEvaluator";

/** Result structure for the solvable hand generator */
export interface SolvableRound {
    hand: string[]; // Complete hand (shuffled)
    objective: string; // Objective satisfied by solution
    solutionExpression: string; // Expression (tokens joined with spaces) that satisfies objective
    value: number; // Evaluated value of the solution expression
}

// Objective pools (mirrors existing GenerateObjective intent)
const EASY_OBJECTIVES = ["Equal to", "Odd number", "Even number"] as const;
const MEDIUM_OBJECTIVES = [
    "Greater than",
    "Less than",
    "Divisible by",
    "Prime number",
] as const;
const HARD_OBJECTIVES = [
    "Power of",
    "Factor of",
    "Prime number",
    "Divisible by",
] as const;

/** Utility helpers */
const isPrime = (n: number) =>
    Number.isInteger(n) && n >= 2 && PRIME_NUMBERS.includes(n as any);
const isPowerOf = (base: number, value: number) => {
    if (value < 1 || !Number.isInteger(value)) return false;
    let current = base;
    while (current < value) current *= base;
    return current === value;
};

function shuffled<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = ((): number => {
            if (typeof crypto !== "undefined" && crypto.getRandomValues) {
                const range = i + 1;
                const max = 0xffffffff;
                const limit = Math.floor(max / range) * range; // rejection limit to remove bias
                const buf = new Uint32Array(1);
                let r: number;
                do {
                    crypto.getRandomValues(buf);
                    r = buf[0];
                } while (r >= limit);
                return r % range;
            }
            // Fallback (non‑cryptographic)
            return Math.floor(Math.random() * (i + 1));
        })();
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function sample<T>(arr: T[]): T {
    if (!arr.length) throw new Error("sample() called with empty array");
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.getRandomValues === "function"
    ) {
        const range = arr.length;
        const max = 0xffffffff;
        const limit = Math.floor(max / range) * range; // rejection sampling to remove modulo bias
        const buf = new Uint32Array(1);
        let r: number;
        do {
            crypto.getRandomValues(buf);
            r = buf[0];
        } while (r >= limit);
        return arr[r % range];
    }
    // Fallback (non‑cryptographic)
    return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
    if (!Number.isFinite(min) || !Number.isFinite(max))
        throw new Error("randInt: min/max must be finite");
    if (max < min) [min, max] = [max, min];
    min = Math.ceil(min);
    max = Math.floor(max);
    const range = max - min + 1;
    if (range <= 0) return min;

    // Cryptographically secure path (rejection sampling to remove modulo bias)
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.getRandomValues === "function"
    ) {
        // Use 32-bit chunks; adequate for game ranges (assumed << 2^32)
        const maxUint = 0xffffffff;
        const limit = Math.floor(maxUint / range) * range;
        const buf = new Uint32Array(1);
        let r: number;
        do {
            crypto.getRandomValues(buf);
            r = buf[0];
        } while (r >= limit);
        return min + (r % range);
    }

    // Fallback (non‑cryptographic)
    return Math.floor(Math.random() * range) + min;
}

/** Build a random linear (no parentheses) expression tokens.
 * Constraint: must fit in result slots (max 6 tokens => at most 3 numbers, 2 operators)
 * Now supports number concatenation where adjacent numbers can be joined
 */
const MAX_RESULT_TOKENS = 6; // matches result slot capacity
function generateExpressionTokens(
    difficulty: DifficultyMode
): { tokens: string[]; value: number } | null {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    
    // Generate expression considering concatenation possibilities
    const result = generateExpressionWithConcatenation(cfg, difficulty);
    if (!result) return null;
    
    const { tokens, value } = result;
    if (tokens.length > MAX_RESULT_TOKENS) return null; // safety guard
    
    return { tokens, value };
}

/** Generate expression tokens that may include concatenated numbers */
function generateExpressionWithConcatenation(
    cfg: any,
    difficulty: DifficultyMode
): { tokens: string[]; value: number } | null {
    // Choose between regular expression or one with concatenation
    const useConcatenation = Math.random() < 0.3; // 30% chance for concatenation
    
    if (useConcatenation) {
        return generateConcatenatedExpression(cfg, difficulty);
    } else {
        return generateRegularExpression(cfg, difficulty);
    }
}

/** Generate expression with potential number concatenation */
function generateConcatenatedExpression(
    cfg: any,
    difficulty: DifficultyMode
): { tokens: string[]; value: number } | null {
    // Start with individual digits that can be concatenated
    const digits: string[] = [];
    const numDigits = randInt(2, 4); // 2-4 individual digits
    
    for (let i = 0; i < numDigits; i++) {
        digits.push(randInt(1, 9).toString()); // single digits 1-9
    }
    
    // Decide concatenation pattern - some digits form multi-digit numbers
    const tokens: string[] = [];
    let i = 0;
    
    while (i < digits.length) {
        // Decide if we should concatenate with next digit(s)
        const shouldConcatenate = i < digits.length - 1 && Math.random() < 0.4;
        
        if (shouldConcatenate && i < digits.length - 1) {
            // Concatenate 2 digits to form a number
            const concatenated = digits[i] + digits[i + 1];
            tokens.push(concatenated);
            i += 2;
        } else {
            // Use single digit
            tokens.push(digits[i]);
            i++;
        }
        
        // Add operator if not the last number and we have operators available
        if (i < digits.length && tokens.length < MAX_RESULT_TOKENS - 1) {
            tokens.push(sample(cfg.operators));
        }
    }
    
    // Evaluate the expression
    const value = evaluateExpression(tokens);
    if (!Number.isFinite(value)) return null;
    
    if (difficulty === "hard") {
        if (!Number.isInteger(value) || value <= 0) return null;
    }
    
    return { tokens, value };
}

/** Generate regular expression without concatenation */
function generateRegularExpression(
    cfg: any,
    difficulty: DifficultyMode
): { tokens: string[]; value: number } | null {
    // Choose number of numeric operands (numbers n => tokens = 2n-1)
    const minNums = difficulty === "easy" ? 1 : 2; // allow single-number objectives
    const maxNums = Math.min(3, 3); // enforce <=3 numbers so tokens <=5
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
    
    if (difficulty === "hard") {
        // Hard objectives require integer positive value for available objective types
        if (!Number.isInteger(value) || value <= 0) return null;
    }

    return { tokens, value };
}

/** Helper: collect divisors within configured range */
function collectDivisors(value: number): number[] {
    const divs: number[] = [];
    if (!Number.isInteger(value)) return divs;
    for (
        let d = GAME_CONFIG.OBJECTIVE.MIN_DIVISOR;
        d <= GAME_CONFIG.OBJECTIVE.MAX_DIVISOR;
        d++
    ) {
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
        candidates.push(value % 2 === 0 ? "Even number" : "Odd number");
    }
    candidates.push(`Equal to ${value}`);
    return pickRandomOrNull(candidates);
}

function deriveMediumObjective(value: number): string | null {
    const candidates: string[] = [];
    // Greater than X (ensure space below value)
    if (value > GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE + 1) {
        const maxLower = Math.max(
            GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE,
            Math.floor(value) - 1
        );
        const lower = randInt(
            GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE,
            maxLower
        );
        candidates.push(`Greater than ${lower}`);
    }
    // Less than Y (ensure space above value)
    if (value < GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE - 1) {
        const minHigher = Math.ceil(value) + 1;
        if (minHigher <= GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE) {
            const higher = randInt(
                minHigher,
                GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE
            );
            if (higher > value) candidates.push(`Less than ${higher}`);
        }
    }
    // Divisible / Prime
    if (Number.isInteger(value) && Math.abs(value) >= 2) {
        const divs = collectDivisors(value);
        if (divs.length) candidates.push(`Divisible by ${sample(divs)}`);
        if (isPrime(value)) candidates.push("Prime number");
    }
    return pickRandomOrNull(candidates);
}

function deriveHardObjective(value: number): string | null {
    if (!Number.isInteger(value) || value <= 0) return null;
    const candidates: string[] = [];

    // Power of base
    for (
        let base = GAME_CONFIG.OBJECTIVE.MIN_POWER;
        base <= GAME_CONFIG.OBJECTIVE.MAX_POWER;
        base++
    ) {
        if (isPowerOf(base, value)) candidates.push(`Power of ${base}`);
    }

    // Factor of target (value is factor of target)
    if (value >= 1) {
        const maxMultiplier = Math.floor(
            GAME_CONFIG.OBJECTIVE.MAX_FACTOR / value
        );
        if (maxMultiplier >= 2) {
            const mult = randInt(2, maxMultiplier);
            const target = value * mult;
            if (
                target >= GAME_CONFIG.OBJECTIVE.MIN_FACTOR &&
                target <= GAME_CONFIG.OBJECTIVE.MAX_FACTOR
            ) {
                candidates.push(`Factor of ${target}`);
            }
        }
    }

    // Divisible by
    const divs = collectDivisors(value);
    if (divs.length) candidates.push(`Divisible by ${sample(divs)}`);
    if (isPrime(value)) candidates.push("Prime number");
    return pickRandomOrNull(candidates);
}

/** Generate objective string consistent with the value and difficulty (refactored for low complexity) */
function deriveObjective(
    value: number,
    difficulty: DifficultyMode
): string | null {
    switch (difficulty) {
        case "easy":
            return deriveEasyObjective(value);
        case "medium":
            return deriveMediumObjective(value);
        case "hard":
            return deriveHardObjective(value);
        default:
            return null;
    }
}

/** Fill the remaining hand slots with distractor tokens (numbers & operators)
 * Now includes individual digits to support concatenation
 */
function buildHandFromExpression(
    tokens: string[],
    difficulty: DifficultyMode
): string[] {
    const handSize = GAME_CONFIG.HAND_SLOTS; // 8
    const cfg = DIFFICULTY_CONFIG[difficulty];
    const hand: string[] = [];
    
    // Break down multi-digit numbers in solution into individual digits for the hand (single-digit number cards only)
    for (const token of tokens) {
        if (/^\d+$/.test(token) && token.length > 1) {
            for (const d of token) hand.push(d);
        } else {
            hand.push(token);
        }
    }

    // Add more individual digits and operators to fill the hand
    while (hand.length < handSize) {
        const currentNumbers = hand.filter((t) => /^\d+$/.test(t)).length;
        const currentOperators = hand.filter((t) => /^[+\-*/^]$/.test(t)).length;
        
        // Maintain a good balance of numbers vs operators
        if (currentNumbers < 5 && (currentOperators >= 3 || Math.random() < 0.6)) {
            // Add individual digits (1-9) to support concatenation
            hand.push(randInt(1, 9).toString());
        } else {
            // Add operators
            hand.push(sample(cfg.operators));
        }
    }
    // Guarantee at least one operator in the hand
    const operatorRegex = /^[+\-*/^]$/;
    if (!hand.some((t) => operatorRegex.test(t))) {
        // Try to replace a random digit with an operator
        const digitIndices = hand
            .map((t, idx) => ({ t, idx }))
            .filter(({ t }) => /^\d+$/.test(t))
            .map(({ idx }) => idx);
        if (digitIndices.length > 0) {
            const replaceIdx = digitIndices[Math.floor(Math.random() * digitIndices.length)];
            hand[replaceIdx] = sample(cfg.operators);
        } else {
            // As a fallback, append an operator and drop the last item to keep size
            hand.push(sample(cfg.operators));
            hand.splice(handSize); // trim to handSize
        }
    }
    
    return shuffled(hand);
}

/** Ensure the hand contains at least the multiset of required tokens for the solution expression
 * Handles concatenated numbers by checking if individual digits are available
 */
function verifyTokenMultiset(
    solutionTokens: string[],
    hand: string[]
): boolean {
    const need: Record<string, number> = {};
    const have: Record<string, number> = {};
    
    // Count what we have in the hand
    hand.forEach((t) => (have[t] = (have[t] || 0) + 1));
    
    // Process solution tokens, breaking down multi-digit numbers into required digits
    for (const token of solutionTokens) {
        if (/^\d+$/.test(token) && token.length > 1) {
            for (const d of token) need[d] = (need[d] || 0) + 1;
        } else {
            need[token] = (need[token] || 0) + 1;
        }
    }
    
    // Check if we have enough of each required token
    return Object.keys(need).every((k) => (have[k] || 0) >= need[k]);
}

/** Objective-first fallback: pick an objective pattern then synthesize a matching expression
 * Now includes concatenation strategies
 */
function generateByObjectiveFirst(
    difficulty: DifficultyMode
): { tokens: string[]; value: number; objective: string } | null {
    // Select a target objective strategy
    const cfg = DIFFICULTY_CONFIG[difficulty];
    // Try limited attempts to find a small expression for a randomly chosen style
    const strategies: Array<
        () => { tokens: string[]; value: number; objective: string } | null
    > = [
        // Equal to target (easy path)
        () => {
            const a = randInt(cfg.minNumber, cfg.maxNumber);
            const b = randInt(cfg.minNumber, cfg.maxNumber);
            const op = sample(cfg.operators);
            const tokens = [String(a), op, String(b)];
            const value = evaluateExpression(tokens);
            if (!Number.isFinite(value)) return null;
            return { tokens, value, objective: `Equal to ${value}` };
        },
        // Parity target
        () => {
            const a = randInt(cfg.minNumber, cfg.maxNumber);
            return {
                tokens: [String(a)],
                value: a,
                objective: a % 2 === 0 ? "Even number" : "Odd number",
            };
        },
        // Concatenation strategy - form a two-digit number
        () => {
            const digit1 = randInt(1, 9);
            const digit2 = randInt(0, 9);
            const concatenated = digit1.toString() + digit2.toString();
            const value = parseInt(concatenated, 10);
            return {
                tokens: [concatenated],
                value,
                objective: `Equal to ${value}`,
            };
        },
        // Concatenation with operation
        () => {
            const digit1 = randInt(1, 5);
            const digit2 = randInt(1, 5);
            const num2 = randInt(1, 9);
            const concatenated = digit1.toString() + digit2.toString();
            const op = sample(['+', '-']); // safer operations for concatenated numbers
            const tokens = [concatenated, op, String(num2)];
            const value = evaluateExpression(tokens);
            if (!Number.isFinite(value)) return null;
            return { tokens, value, objective: `Equal to ${value}` };
        },
    ];
    for (let attempt = 0; attempt < 20; attempt++) {
        const strat = sample(strategies);
        const r = strat();
        if (r) return r;
    }
    return null;
}

/** Public API: generate a solvable round (expression-first approach) */
export function generateSolvableHandAndObjective(
    difficulty: DifficultyMode,
    maxAttempts = 50
): SolvableRound {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const expr = generateExpressionTokens(difficulty);
        if (!expr) continue;
        const objective = deriveObjective(expr.value, difficulty);
        if (!objective) continue; // regenerate
        const hand = buildHandFromExpression(expr.tokens, difficulty);
        if (!verifyTokenMultiset(expr.tokens, hand)) continue; // ensure solution tokens all present
        if (expr.tokens.length > MAX_RESULT_TOKENS) continue; // enforce constraint (redundant guard)
        return {
            hand,
            objective,
            solutionExpression: expr.tokens.join(" "),
            value: expr.value,
        };
    }
    // Fallback: objective-first synthesis
    const fallback = generateByObjectiveFirst(difficulty);
    if (fallback) {
        const hand = buildHandFromExpression(fallback.tokens, difficulty);
        if (fallback.tokens.length > MAX_RESULT_TOKENS) {
            // reduce to single number fallback
            const single = [String(fallback.value)];
            return {
                hand: buildHandFromExpression(single, difficulty),
                objective: `Equal to ${fallback.value}`,
                solutionExpression: single.join(" "),
                value: fallback.value,
            };
        }
        return {
            hand,
            objective: fallback.objective,
            solutionExpression: fallback.tokens.join(" "),
            value: fallback.value,
        };
    }
    // Fallback: trivial easy expression as last resort
    const fallbackValue = 12; // Use a concatenated number as fallback
    return {
        hand: ["1", "2", "+", "-", "3", "4", "*", "/"],
        objective: `Equal to ${fallbackValue}`,
        solutionExpression: "12", // "1" + "2" concatenated
        value: fallbackValue,
    };
}
