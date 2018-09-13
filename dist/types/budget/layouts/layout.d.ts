import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
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
    private readonly _isGaugeDisplayed;
    protected constructor(budget: Budget, svgElement: D3Selection, isGaugeDisplayed?: boolean);
    initialize(): void;
    render(): void;
    protected abstract initializeLayout(): any;
    protected abstract renderLayout(): any;
}
