import * as d3 from 'd3-selection';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { Budget } from './budget';
import { CommandInvoker } from './commands/command-invoker';
import { Layout } from './layouts/layout';
import { RenderingVisitor } from './visitors/rendering-visitor';
export declare class BudgetVisualization {
    private readonly _budget;
    private readonly _commandInvoker;
    private readonly _svgElement;
    private readonly _rendering;
    private _layout;
    private _isEnabled;
    private _isInitialized;
    constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, layout: Layout, commandInvoker?: CommandInvoker, rendering?: RenderingVisitor);
    activeLevel: number;
    readonly budget: Budget;
    isEnabled: boolean;
    initialize(): void;
    reset(): void;
    update(layout: Layout, polygonsGroupConfig?: PolygonsGroupConfig): void;
}
