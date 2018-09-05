import * as d3 from 'd3-selection';
import 'd3-transition';
import { Budget } from '../budget';
import { Layout } from './layout';
import { LayoutConfig } from './layout-config';
export declare class GridLayout extends Layout {
    private readonly _config;
    private readonly _countPerLine;
    private readonly _spacing;
    private readonly _budgetWidth;
    constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, config: LayoutConfig);
    protected initializeLayout(): void;
    protected renderLayout(): void;
}
