import { BudgetConfig } from './budget-config';
import { BudgetElement } from './budget-element';
export declare enum BudgetState {
    BALANCED = "balanced",
    DEFICIT = "deficit",
    SURPLUS = "surplus"
}
export interface BudgetSummary {
    delta: number;
    incomesAmount: number;
    spendingsAmount: number;
    state: BudgetState;
}
export declare class Budget {
    readonly year: number;
    readonly incomes: BudgetElement[];
    readonly spendings: BudgetElement[];
    readonly minAmount: number;
    private static _amountStack;
    constructor(budgetConfig: BudgetConfig, minAmount?: number);
    readonly elements: BudgetElement[];
    readonly summary: BudgetSummary;
    private initializeBudgetElement;
    private isAcceptableAmount;
}
