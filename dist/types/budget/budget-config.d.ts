import { BudgetElement } from './budget-element';
import { BudgetElementType } from './budget-element-config';
export interface BudgetAdjustment {
    amount: number;
    name: string;
    type: BudgetElementType;
}
interface BudgetItemConfig {
    amount?: number;
    children?: BudgetElement[];
    isMutable?: boolean;
    name: string;
    mustBeKeep: boolean;
}
export interface BudgetConfig {
    adjustments?: BudgetAdjustment[];
    incomes: BudgetItemConfig[];
    spendings: BudgetItemConfig[];
    year: number;
}
export declare function isBudgetConfig(budgetConfig: any): budgetConfig is BudgetConfig;
export {};
