import 'd3-transition';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
import { Layout } from './layout';
import { LayoutConfig } from './layout-config';
export declare class BarsLayout extends Layout {
    constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig);
    protected initializeLayout(): void;
    protected renderLayout(): void;
}
