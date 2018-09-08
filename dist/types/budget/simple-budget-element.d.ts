import { Selection } from 'd3-selection';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { SquaresGroup } from '../geometry/squares-group';
import { BudgetElement, BudgetElementType } from './budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
export declare class SimpleBudgetElement extends BudgetElement {
    readonly initialAmount: number;
    private readonly _group;
    private _hasFocus;
    private _svgElement;
    constructor(amount?: number, name?: string, description?: string, type?: BudgetElementType, minAmount?: number, polygonsGroupConfig?: PolygonsGroupConfig);
    activeLevel: number;
    hasFocus: boolean;
    level: number;
    svgElement: Selection<any, any, any, any>;
    readonly polygonsGroup: SquaresGroup;
    accept(visitor: BudgetElementVisitor): void;
    reset(): void;
}
