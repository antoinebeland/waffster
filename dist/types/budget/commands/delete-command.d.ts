import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';
import { UndoableCommand } from './command';
export declare class DeleteCommand implements UndoableCommand {
    private readonly _amount;
    private readonly _element;
    private readonly _rendering;
    private readonly _layout;
    constructor(element: BudgetElement, rendering: RenderingVisitor, layout: Layout);
    execute(): void;
    undo(): void;
    private update;
}
