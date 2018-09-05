import * as d3 from 'd3-selection';
import { Budget } from '../budget';
declare type D3Selection = d3.Selection<any, any, any, any>;
export declare abstract class Layout {
    protected readonly _budget: Budget;
    protected readonly _svgElement: D3Selection;
    protected _layoutElement: D3Selection;
    protected _budgetGroup: D3Selection;
    protected _incomeGroups: D3Selection;
    protected _spendingGroups: D3Selection;
    protected _gaugeGroup: D3Selection;
    protected _height: number;
    protected _width: number;
    protected constructor(budget: Budget, svgElement: D3Selection);
    initialize(): void;
    render(): void;
    protected abstract initializeLayout(): any;
    protected abstract renderLayout(): any;
}
export {};
