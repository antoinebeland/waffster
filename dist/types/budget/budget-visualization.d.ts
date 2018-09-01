import * as d3 from 'd3-selection';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { Budget } from './budget';
import { CommandInvoker } from './commands/command-invoker';
import { Layout } from './layouts/layout';
import { RenderingVisitor } from './visitors/rendering-visitor';
export declare class BudgetVisualization {
    readonly budget: Budget;
    readonly commandInvoker: CommandInvoker;
    readonly svgElement: d3.Selection<any, any, any, any>;
    readonly rendering: RenderingVisitor;
    private _layout;
    private _isEnabled;
    private _isInitialized;
    constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, layout: Layout, commandInvoker?: CommandInvoker, rendering?: RenderingVisitor);
    activeLevel: number;
    isEnabled: boolean;
    readonly layout: Layout;
    initialize(): void;
    reset(): void;
    update(layout: Layout, polygonsGroupConfig?: PolygonsGroupConfig): void;
}
