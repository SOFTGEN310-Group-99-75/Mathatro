export function solveProblem(cardArray: any[]): number[] | null {

    // First we seperate the card array into different problems - an array of strings
    let problems: string[] = [];

    let lastWasNumber = false;
    cardArray.forEach(card => {
        if (card.value === undefined || card.isOperator === undefined) {
            console.log("Error: card does not have value or isOperator: " + JSON.stringify(card));
            return null;
        }

        if (card.isOperator === true) {
            lastWasNumber = false;
            // add operator 
            problems[-1] += card.value;
        } else if (card.isOperator === false) {
            if (lastWasNumber === true) {
                // if the last entry was a number, we start a new problem
                problems.push("" + card.value);
            } else if (lastWasNumber === false) {
                // if the previous entry was an operator, we need to have numbers either sides
                problems[-1] += card.value;
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

function solveStringProblem(stringProblem: string): number | null {
    let solution: number = 0;
    let lastOperator: string = "";
    let numberBuffer: string = "";
    for (const character of stringProblem) {
        if (!isNaN(Number(character))) {
            // digits
            numberBuffer += character;
        } else {
            // operator - apply last operator and buffered number, then update last operator and reset buffered number
            switch (lastOperator) {
                case '+':
                    solution += Number(numberBuffer);
                    break;
                case '-':
                    solution -= Number(numberBuffer);
                    break;
                case '*':
                    solution *= Number(numberBuffer);
                    break;
                case '/':
                    solution /= Number(numberBuffer);
                    break;
                case '^':
                    solution = Math.pow(solution, Number(numberBuffer));
                    break;
                case '':
                    break;
                default:
                    console.log("Error: unsupported operator: " + lastOperator);
            }

            numberBuffer = "";
            lastOperator = character;
        }
    }
    return solution;
}
