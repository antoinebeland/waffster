import { Selection } from 'd3-selection';
import { AbstractPolygonsGroup } from '../geometry/abstract-polygons-group';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
export declare enum BudgetElementType {
    DEFICIT = "deficit",
    INCOME = "income",
    SPENDING = "spending"
}
export declare abstract class BudgetElement {
    protected _minAmount: number;
    protected _activeLevel: number;
    protected _level: number;
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: BudgetElementType;
    parent: BudgetElement;
    protected constructor(name: string, description: string, type: BudgetElementType, minAmount: number);
    abstract activeLevel: number;
    abstract hasFocus: boolean;
    abstract readonly initialAmount: number;
    abstract level: number;
    abstract svgElement: Selection<any, any, any, any>;
    abstract readonly polygonsGroup: AbstractPolygonsGroup;
    amount: number;
    readonly isActive: boolean;
    readonly root: BudgetElement;
    selectedAmount: number;
    temporaryAmount: number;
    abstract accept(visitor: BudgetElementVisitor): any;
    abstract reset(): any;
}
