import { GAME_CONFIG, OBJECTIVE_TYPES, PRIME_NUMBERS, DIFFICULTY_CONFIG, DifficultyMode } from './config/GameConstants';

// Difficulty-specific objective pools
const EASY_OBJECTIVES = ["Equal to", "Odd number", "Even number"];
const MEDIUM_OBJECTIVES = ["Greater than", "Less than", "Divisible by", "Prime number"];
const HARD_OBJECTIVES = ["Power of", "Factor of", "Prime number", "Divisible by"];

export const GenerateObjective = (difficulty: DifficultyMode): string => {
    let pool: string[];

    switch (difficulty) {
        case "easy":
            pool = EASY_OBJECTIVES;
            break;
        case "medium":
            pool = MEDIUM_OBJECTIVES;
            break;
        case "hard":
            pool = HARD_OBJECTIVES;
            break;
        default:
            pool = OBJECTIVE_TYPES;
    }

    const obj = Phaser.Utils.Array.GetRandom(pool);
    let objective = "";

    switch (obj) {
        case "Greater than":
        case "Less than":
        case "Equal to": {
            const num = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_COMPARISON_VALUE, GAME_CONFIG.OBJECTIVE.MAX_COMPARISON_VALUE);
            objective = `${obj} ${num}`;
            break;
        }
        case "Factor of": {
            const factor = generateNonPrime();
            objective = `${obj} ${factor}`;
            break;
        }
        case "Divisible by": {
            const divisor = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_DIVISOR, GAME_CONFIG.OBJECTIVE.MAX_DIVISOR);
            objective = `${obj} ${divisor}`;
            break;
        }
        case "Power of": {
            const power = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_POWER, GAME_CONFIG.OBJECTIVE.MAX_POWER);
            objective = `${obj} ${power}`;
            break;
        }
        case "Prime number":
        case "Odd number":
        case "Even number":
            objective = obj;
            break;
    }

    return objective;
};

export const generateNonPrime = (): number => {
    let num = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_FACTOR, GAME_CONFIG.OBJECTIVE.MAX_FACTOR);
    while (PRIME_NUMBERS.includes(num as any)) {
        num = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_FACTOR, GAME_CONFIG.OBJECTIVE.MAX_FACTOR);
    }
    return num;
};
