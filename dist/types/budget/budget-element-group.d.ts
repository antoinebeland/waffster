import { Selection } from 'd3-selection';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { PolygonsSuperGroup } from '../geometry/polygons-super-group';
import { BudgetElement, BudgetElementType } from './budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
export declare class BudgetElementGroup extends BudgetElement {
    private readonly _children;
    private readonly _group;
    private _hasFocus;
    private _svgElement;
    constructor(name: string, description: '', type?: BudgetElementType, minAmount?: number, polygonsGroupConfig?: PolygonsGroupConfig);
    activeLevel: number;
    hasFocus: boolean;
    level: number;
    svgElement: Selection<any, any, any, any>;
    readonly polygonsGroup: PolygonsSuperGroup;
    readonly children: BudgetElement[];
    accept(visitor: BudgetElementVisitor): void;
    addChild(element: BudgetElement): void;
    removeChild(element: BudgetElement): void;
}
