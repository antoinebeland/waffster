import * as d3 from 'd3-selection';
import { Budget } from '../budget';
export declare abstract class Layout {
    protected readonly _budget: Budget;
    protected readonly _svgElement: d3.Selection<any, any, any, any>;
    protected _layout: any;
    protected _budgetGroup: any;
    protected _incomeGroups: any;
    protected _spendingGroups: any;
    protected _gaugeGroup: any;
    protected _height: number;
    protected _width: number;
    protected constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>);
    initialize(): void;
    render(): void;
    protected abstract initializeLayout(): any;
    protected abstract renderLayout(): any;
}
