export class Card{
    protected multiplier: number;
    protected baseScore: number;
    isOperator!: boolean;

    constructor(multiplier: number, baseScore: number)
    {
        this.multiplier = multiplier;
        this.baseScore = baseScore;
    }

    getMultiplier()
    {
        return this.multiplier;
    }

    getBaseScore()
    {
        return this.baseScore;
    }

    setMultiplier(multiplier: number)
    {
        this.multiplier = multiplier;
    }

    setBaseScore(baseScore: number)
    {
        this.baseScore = baseScore;
    }
}
export class NumberCard extends Card{
    public value: number;

    constructor(value: number)
    {
        super(1,10); // by default   
        this.value = value;
        this.isOperator = false;
    }
}

export class OperatorCard extends Card{
    public value: string;

    constructor(symbol: string)
    {
        super(1,10); // by default
        this.value = symbol;
        this.isOperator = true;
    }
}
