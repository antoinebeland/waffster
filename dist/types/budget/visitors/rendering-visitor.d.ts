import 'd3-transition';
import { BudgetElementGroup } from '../budget-element-group';
import { SimpleBudgetElement } from '../simple-budget-element';
import { BudgetElementVisitor } from './budget-element-visitor';
export declare class RenderingVisitor implements BudgetElementVisitor {
    private readonly _defaultTransitionDuration;
    private readonly _levelStack;
    private _transitionDuration;
    constructor(defaultTransitionDuration: number);
    transitionDuration: number;
    resetTransitionDuration(): void;
    visitBudgetElementGroup(group: BudgetElementGroup): void;
    visitSimpleBudgetElement(element: SimpleBudgetElement): void;
    private static createEmptyElement;
    private static updateBoundary;
}
