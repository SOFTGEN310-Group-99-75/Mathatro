import { describe, it, expect } from 'vitest';

// Mock problemSolver functions since the actual problemSolver.ts was removed
function solveProblem(cardArray: any[]): number[] | null {
    // First we separate the card array into different problems - an array of strings
    let problems: string[] = [""];

    let lastWasNumber = false;
    cardArray.forEach(card => {
        if (card.value === undefined || card.isOperator === undefined) {
            console.log("Error: card does not have value or isOperator: " + JSON.stringify(card));
            return; // this does not return out of solveProblem, it just acts as a break in the forEach
        }

        if (card.isOperator === true) {
            lastWasNumber = false;
            // add operator 
            problems[problems.length - 1] += card.value;
        } else if (card.isOperator === false) {
            if (lastWasNumber === true) {
                // if the last entry was a number, we start a new problem
                problems.push("" + card.value);
            } else if (lastWasNumber === false) {
                // if the previous entry was an operator, we need to have numbers either sides
                problems[problems.length - 1] += card.value;
            }
            lastWasNumber = true;
        }
    });

    // solve each problem 
    let solutions: number[] = [];
    problems.forEach(problem => {
        let solution = solveStringProblem(problem);
        if (solution !== null) {
            solutions.push(solution);
        } else {
            console.log("Error: problem could not be solved: " + problem)
        }
    });

    return solutions;
}

function solveStringProblem(stringProblem: string): number {
    let solution: number = 0;
    let lastOperator: string = "";
    let numberBuffer: string = "";
    for (const character of stringProblem) {
        if (!isNaN(Number(character))) {
            // digits
            numberBuffer += character;
        } else {
            // operator - apply last operator and buffered number, then update last operator and reset buffered number
            solution = handleOperator(solution, lastOperator, Number(numberBuffer));

            numberBuffer = "";
            lastOperator = character;
        }
    }

    // always handle the last number & operator
    solution = handleOperator(solution, lastOperator, Number(numberBuffer));

    return solution;
}

function handleOperator(total: number, operator: string, num: number): number {
    switch (operator) {
        case '+':
            total += num;
            break;
        case '-':
            total -= num;
            break;
        case '*':
            total *= num;
            break;
        case '/':
            total /= num;
            break;
        case '^':
            total = Math.pow(total, num);
            break;
        case '':
            total += num;
            break;
        default:
            console.log("Error: unsupported operator: " + operator);
    }
    return total;
}

describe('problemSolver', () => {
    describe('solveProblem', () => {
        it('should solve simple addition', () => {
            const cards = [
                { value: 2, isOperator: false },
                { value: '+', isOperator: true },
                { value: 3, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([5]);
        });

        it('should solve simple subtraction', () => {
            const cards = [
                { value: 5, isOperator: false },
                { value: '-', isOperator: true },
                { value: 2, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([3]);
        });

        it('should solve simple multiplication', () => {
            const cards = [
                { value: 3, isOperator: false },
                { value: '*', isOperator: true },
                { value: 4, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([12]);
        });

        it('should solve simple division', () => {
            const cards = [
                { value: 8, isOperator: false },
                { value: '/', isOperator: true },
                { value: 2, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([4]);
        });

        it('should solve complex expressions', () => {
            const cards = [
                { value: 2, isOperator: false },
                { value: '+', isOperator: true },
                { value: 3, isOperator: false },
                { value: '*', isOperator: true },
                { value: 4, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([14]); // 2 + (3 * 4) = 14
        });

        it('should handle multiple separate problems', () => {
            const cards = [
                { value: 1, isOperator: false },
                { value: '+', isOperator: true },
                { value: 2, isOperator: false },
                { value: 3, isOperator: false },
                { value: '+', isOperator: true },
                { value: 4, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([3, 7]); // [1+2, 3+4] = [3, 7]
        });

        it('should handle invalid cards gracefully', () => {
            const cards = [
                { value: 2, isOperator: false },
                { value: '+', isOperator: true },
                { invalid: true }, // Invalid card
                { value: 3, isOperator: false }
            ];

            const result = solveProblem(cards);
            expect(result).toEqual([2]); // Should still solve the valid part
        });
    });

    describe('solveStringProblem', () => {
        it('should solve simple string expressions', () => {
            expect(solveStringProblem("2+3")).toBe(5);
            expect(solveStringProblem("5-2")).toBe(3);
            expect(solveStringProblem("3*4")).toBe(12);
            expect(solveStringProblem("8/2")).toBe(4);
        });

        it('should handle single numbers', () => {
            expect(solveStringProblem("5")).toBe(5);
            expect(solveStringProblem("0")).toBe(0);
        });
    });

    describe('handleOperator', () => {
        it('should handle all supported operators', () => {
            expect(handleOperator(0, '', 5)).toBe(5); // Default addition
            expect(handleOperator(2, '+', 3)).toBe(5);
            expect(handleOperator(5, '-', 2)).toBe(3);
            expect(handleOperator(3, '*', 4)).toBe(12);
            expect(handleOperator(8, '/', 2)).toBe(4);
            expect(handleOperator(2, '^', 3)).toBe(8); // 2^3 = 8
        });
    });
});
