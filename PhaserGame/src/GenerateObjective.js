import { GAME_CONFIG, OBJECTIVE_TYPES, PRIME_NUMBERS } from './config/GameConstants';

export const GenerateObjective = () => {

    const obj = OBJECTIVE_TYPES[Phaser.Math.Between(0, OBJECTIVE_TYPES.length - 1)];
    console.log(obj);

    let objective = '';
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
        // starting from 3 so don't conflict with even number
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
    }

    return objective;
};


export const generateNonPrime = () => {
    let num = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_FACTOR, GAME_CONFIG.OBJECTIVE.MAX_FACTOR);
    while (PRIME_NUMBERS.includes(num)) {
        num = Phaser.Math.Between(GAME_CONFIG.OBJECTIVE.MIN_FACTOR, GAME_CONFIG.OBJECTIVE.MAX_FACTOR);
    }
    return num;
}