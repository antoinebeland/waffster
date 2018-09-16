import d3Tip from 'd3-tip';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { Event } from '../utils/event';
import { D3Selection } from '../utils/types';
import { Budget } from './budget';
import { BudgetElement } from './budget-element';
import { Command } from './commands/command';
import { CommandInvoker } from './commands/command-invoker';
import { Layout } from './layouts/layout';
import { RenderingVisitor } from './visitors/rendering-visitor';
export declare class BudgetVisualization {
    readonly budget: Budget;
    readonly commandInvoker: CommandInvoker;
    readonly svgElement: D3Selection;
    readonly rendering: RenderingVisitor;
    readonly tip: d3Tip;
    readonly onActionExecuted: Event<Command>;
    readonly onInvalidActionExecuted: Event<BudgetElement>;
    private _layout;
    private _isEnabled;
    private _isInitialized;
    constructor(budget: Budget, svgElement: D3Selection, layout: Layout, commandInvoker?: CommandInvoker, rendering?: RenderingVisitor);
    activeLevel: number;
    isEnabled: boolean;
    readonly layout: Layout;
    initialize(): void;
    reset(): void;
    update(layout: Layout, polygonsGroupConfig?: PolygonsGroupConfig): void;
}
