import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
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
    private readonly _polygonsGroupConfig;
    constructor(budgetConfig: BudgetConfig, minAmount?: number, polygonsGroupConfig?: PolygonsGroupConfig);
    readonly elements: BudgetElement[];
    readonly summary: BudgetSummary;
    getElementByName(name: string): BudgetElement;
    private getBudgetElementConfig;
    private initializeBudgetElement;
    private isAcceptableAmount;
}
