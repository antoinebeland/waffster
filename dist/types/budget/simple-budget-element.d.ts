import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { SquaresGroup } from '../geometry/squares-group';
import { D3Selection } from '../utils/types';
import { BudgetElement } from './budget-element';
import { BudgetElementConfig } from './budget-element-config';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
export declare class SimpleBudgetElement extends BudgetElement {
    readonly initialAmount: number;
    private readonly _group;
    private _hasFocus;
    private _svgElement;
    constructor(config: BudgetElementConfig, amount?: number, polygonsGroupConfig?: PolygonsGroupConfig);
    activeLevel: number;
    hasFocus: boolean;
    level: number;
    readonly polygonsGroup: SquaresGroup;
    svgElement: D3Selection;
    accept(visitor: BudgetElementVisitor): void;
    reset(): void;
}
