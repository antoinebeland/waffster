export declare enum BudgetElementType {
    DEFICIT = "deficit",
    INCOME = "income",
    SPENDING = "spending"
}
export interface FeedbackMessage {
    interval: number[];
    message: string;
}
export interface BudgetElementConfig {
    name: string;
    description: string;
    type: BudgetElementType;
    minAmount: number;
    isMutable: boolean;
    feedbackMessages: FeedbackMessage[];
}
export declare function isBudgetElementConfig(config: any): config is BudgetElementConfig;
