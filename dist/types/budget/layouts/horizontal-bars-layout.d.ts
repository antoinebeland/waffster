import * as d3 from 'd3-selection';
import 'd3-transition';
import { Budget } from '../budget';
import { Layout } from './layout';
import { LayoutConfig } from './layout-config';
export declare class HorizontalBarsLayout extends Layout {
    private readonly _config;
    constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, config: LayoutConfig);
    protected initializeLayout(): void;
    protected renderLayout(): void;
}