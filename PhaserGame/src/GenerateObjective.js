export const GenerateObjective = () => {

    var obj = requirements[Phaser.Math.Between(0, requirements.length - 1)];
    console.log(obj);

    var objective = '';
    switch(obj){
        case "Greater than":
        case "Less than":
        case "Equal to":
            var num = Phaser.Math.Between(1, 100);
            objective = `${obj} ${num}`;
            break;
        case "Factor of":
            var factor = generateNonPrime();
            objective = `${obj} ${factor}`;
            break;
        // starting from 3 so don't conflict with even number
        case "Divisible by":
            var divisor = Phaser.Math.Between(3, 10);
            objective = `${obj} ${divisor}`;
            break;
        case "Power of":
            var power = Phaser.Math.Between(2, 5);
            objective = `${obj} ${power}`;
            break;
        case "Prime number":
        case "Odd number":
        case "Even number":
            objective = obj;
    }

    return objective;
};

const requirements = [
    "Greater than",
    "Less than",
    "Equal to",
    "Divisible by",
    "Power of",
    "Prime number",
    "Odd number",
    "Even number",
    "Factor of",
];

// List of prime numbers
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

export const generateNonPrime = () => {
    var num = Phaser.Math.Between(10, 100);
    while (primes.includes(num)) {
        num = Phaser.Math.Between(10, 100);
    }
    return num;
}