import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
import { LayoutConfig } from './layout-config';
export declare abstract class Layout {
    protected readonly _budget: Budget;
    protected readonly _svgElement: D3Selection;
    protected readonly _config: LayoutConfig;
    protected _layoutElement: D3Selection;
    protected _budgetGroup: D3Selection;
    protected _incomeGroups: D3Selection;
    protected _spendingGroups: D3Selection;
    protected _gaugeGroup: D3Selection;
    protected _height: number;
    protected _width: number;
    private readonly _defaultTransitionDuration;
    protected constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig);
    readonly locale: string;
    transitionDuration: number;
    initialize(): void;
    render(): void;
    resetTransitionDuration(): void;
    protected abstract initializeLayout(): any;
    protected abstract renderLayout(): any;
    private static sortElements;
}
