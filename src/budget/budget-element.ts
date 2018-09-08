import { Selection } from 'd3-selection';

import { AbstractPolygonsGroup } from '../geometry/abstract-polygons-group';
import { Formatter } from '../utils/formatter';

import { BudgetElementVisitor } from './visitors/budget-element-visitor';

/**
 * Defines the possible types for a budget element.
 */
export enum BudgetElementType {
  DEFICIT = 'deficit',
  INCOME = 'income',
  SPENDING = 'spending'
}

 /**
 * Defines an abstract budget element.
 */
export abstract class BudgetElement {
  protected _minAmount: number;
  protected _activeLevel = 0;
  protected _level = 0;

  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: BudgetElementType;
  parent: BudgetElement;

  /**
   * Initializes a new instance of the BudgetElement class.
   *
   * @param name          The name of the element.
   * @param description   The element description.
   * @param type          The element type.
   * @param minAmount     The min amount to use.
   */
  protected constructor(name: string, description = '', type: BudgetElementType, minAmount: number) {
    if (minAmount <= 0) {
      throw new RangeError('The min amount must be greater than 0.');
    }
    this.id = Formatter.formatId(name);
    this.name = name;
    this.description = description;
    this.type = type;
    this._minAmount = minAmount;
  }

  /**
   * Gets the active level.
   */
  abstract get activeLevel(): number;

  /**
   * Sets the active level of the element.
   *
   * @param level       The level to set as active.
   */
  abstract set activeLevel(level: number);

  abstract get hasFocus(): boolean;

  abstract set hasFocus(hasFocus: boolean);

  abstract get initialAmount(): number;

  /**
   * Gets the level of the element.
   *
   * @return {number}   The level of the element.
   */
  abstract get level(): number;

  /**
   * Sets the level of the element.
   *
   * @param level       The level to set.
   */
  abstract set level(level: number);

  /**
   * Gets the element associated with the element.
   *
   * @returns {any}     The element associated.
   */
  abstract get svgElement(): Selection<any, any, any, any>;

  /**
   * Sets the element associated with the element.
   *
   * @param element     The element to set.
   */
  abstract set svgElement(element: Selection<any, any, any, any>);

  /**
   * Gets the polygons group associated with the element.
   *
   * @returns {AbstractPolygonsGroup}   The polygons group associated with the element.
   */
  abstract get polygonsGroup(): AbstractPolygonsGroup;

  /**
   * Gets the amount of the element.
   */
  get amount(): number {
    return this.polygonsGroup.count * this._minAmount;
  }

  /**
   * Sets the amount of the element.
   *
   * @param amount        The amount to set.
   */
  set amount(amount: number) {
    if (amount < 0) {
      throw new TypeError('Invalid amount specified.');
    }
    this.polygonsGroup.count = Math.ceil(amount / this._minAmount);
  }

   /**
   * Indicates if the current element is active.
   *
   * @return {boolean}  TRUE if the current element is active. FALSE otherwise.
   */
  get isActive(): boolean {
    return this._level === this.activeLevel;
  }

  get root(): BudgetElement {
    let element: BudgetElement = this;
    while (element.parent !== undefined) {
      element = element.parent;
    }
    return element;
  }

  get selectedAmount(): number {
    return this.polygonsGroup.selectionCount * this._minAmount;
  }

  set selectedAmount(selectedAmount: number) {
    if (selectedAmount < 0) {
      selectedAmount = 0;
    }
    if (this.selectedAmount === selectedAmount) {
      return;
    }
    selectedAmount = Math.min(selectedAmount, this.amount);
    this.polygonsGroup.selectionCount = Math.ceil(selectedAmount / this._minAmount);
  }

  get temporaryAmount(): number {
    return this.polygonsGroup.temporaryCount * this._minAmount;
  }

  set temporaryAmount(temporaryAmount: number) {
    this.polygonsGroup.temporaryCount = Math.ceil(temporaryAmount / this._minAmount);
  }

  abstract accept(visitor: BudgetElementVisitor);
  abstract reset();
}
