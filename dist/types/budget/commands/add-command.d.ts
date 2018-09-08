import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';
import { UndoableCommand } from './command';
export declare class AddCommand implements UndoableCommand {
    readonly element: BudgetElement;
    readonly amount: number;
    private readonly _rendering;
    private readonly _layout;
    private _isFirstTime;
    constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout);
    execute(): void;
    undo(): void;
    private update;
}
