import { BudgetElement } from './budget-element';
interface BudgetElementConfig {
    amount?: number;
    children?: BudgetElement[];
    name: string;
}
export interface BudgetConfig {
    incomes: BudgetElementConfig[];
    spendings: BudgetElementConfig[];
    year: number;
}
export declare function isBudgetConfig(budgetConfig: any): budgetConfig is BudgetConfig;
export {};
