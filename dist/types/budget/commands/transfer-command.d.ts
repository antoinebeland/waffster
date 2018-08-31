import { BudgetElement } from '../budget-element';
import { Layout } from '../layouts/layout';
import { RenderingVisitor } from '../visitors/rendering-visitor';
import { UndoableCommand } from './command';
export declare class TransferCommand implements UndoableCommand {
    private readonly _amount;
    private readonly _source;
    private readonly _destination;
    private readonly _renderingVisitor;
    private readonly _layout;
    private _isFirstTime;
    constructor(source: BudgetElement, destination: BudgetElement, renderingVisitor: RenderingVisitor, layout: Layout);
    execute(): void;
    undo(): void;
    private update;
}
