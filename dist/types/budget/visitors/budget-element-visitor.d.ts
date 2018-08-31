import { BudgetElementGroup } from '../budget-element-group';
import { SimpleBudgetElement } from '../simple-budget-element';
export interface BudgetElementVisitor {
    visitBudgetElementGroup(group: BudgetElementGroup): any;
    visitSimpleBudgetElement(element: SimpleBudgetElement): any;
}
