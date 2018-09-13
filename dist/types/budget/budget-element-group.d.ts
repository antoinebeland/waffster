import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { PolygonsSuperGroup } from '../geometry/polygons-super-group';
import { D3Selection } from '../utils/types';
import { BudgetElement } from './budget-element';
import { BudgetElementConfig } from './budget-element-config';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
export declare class BudgetElementGroup extends BudgetElement {
    private readonly _children;
    private readonly _group;
    private _hasFocus;
    private _svgElement;
    constructor(config: BudgetElementConfig, polygonsGroupConfig: PolygonsGroupConfig);
    activeLevel: number;
    hasFocus: boolean;
    readonly initialAmount: number;
    level: number;
    readonly polygonsGroup: PolygonsSuperGroup;
    svgElement: D3Selection;
    readonly children: BudgetElement[];
    accept(visitor: BudgetElementVisitor): void;
    reset(): void;
    addChild(element: BudgetElement): void;
    removeChild(element: BudgetElement): void;
}
