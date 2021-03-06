import 'd3-transition';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
import { Layout } from './layout';
import { LayoutConfig } from './layout-config';
export declare class GridLayout extends Layout {
    private readonly _countPerLine;
    private readonly _spacing;
    private readonly _budgetWidth;
    private readonly _gaugeHeight;
    constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig, minCountPerLine?: number);
    protected initializeLayout(): void;
    protected renderLayout(): void;
}
