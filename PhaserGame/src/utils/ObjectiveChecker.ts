// utils/ObjectiveChecker.ts
import { PRIME_NUMBERS } from '../config/GameConstants';

function isPrime(num: number): boolean {
  return PRIME_NUMBERS.includes(num as any);
}

function isPowerOf(base: number, value: number): boolean {
  if (value < 1) return false;
  let current = base;
  while (current < value) {
    current *= base;
  }
  return current === value;
}

export function checkObjective(result: number, objective: string): boolean {
  if (objective.startsWith("Equal to")) {
    const num = parseInt(objective.split(" ")[2]);
    return result === num;
  }
  if (objective.startsWith("Greater than")) {
    const num = parseInt(objective.split(" ")[2]);
    return result > num;
  }
  if (objective.startsWith("Less than")) {
    const num = parseInt(objective.split(" ")[2]);
    return result < num;
  }
    if (objective.startsWith("Power of")) {
    const base = parseInt(objective.split(" ")[2]);
    return isPowerOf(base, result);
  }
  if (objective.startsWith("Factor of")) {
    const num = parseInt(objective.split(" ")[2]);
    return num % result === 0; 
  }
  if (objective.startsWith("Divisible by")) {
    const num = parseInt(objective.split(" ")[2]);
    return result % num === 0;
  }
  if (objective === "Prime number") {
    return isPrime(result);
  }
  if (objective === "Odd number") {
    return result % 2 === 1;
  }
  if (objective === "Even number") {
    return result % 2 === 0;
  }
  return false;
}
