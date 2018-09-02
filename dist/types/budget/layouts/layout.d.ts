import * as d3 from 'd3-selection';
import { Budget } from '../budget';
export declare abstract class Layout {
    protected readonly _budget: Budget;
    protected readonly _svgElement: d3.Selection<any, any, any, any>;
    protected readonly _elements: Map<string, d3.Selection<any, any, any, any>>;
    protected _layoutElement: d3.Selection<any, any, any, any>;
    protected _budgetGroup: d3.Selection<any, any, any, any>;
    protected _incomeGroups: d3.Selection<any, any, any, any>;
    protected _spendingGroups: d3.Selection<any, any, any, any>;
    protected _gaugeGroup: d3.Selection<any, any, any, any>;
    protected _height: number;
    protected _width: number;
    protected constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>);
    initialize(): void;
    render(): void;
    protected abstract initializeLayout(): any;
    protected abstract renderLayout(): any;
}
