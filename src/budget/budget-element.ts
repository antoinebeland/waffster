import { Config } from '../config';
import { AbstractPolygonsGroup } from '../geometry/abstract-polygons-group';

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
   * @param [type]        The element type. By default, the element is a spending.
   */
  protected constructor(name: string, description = '', type: BudgetElementType = BudgetElementType.SPENDING) {
    this.id = Formatter.formatId(name);
    this.name = name;
    this.description = description;
    this.type = type;
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
  abstract get svgElement(): any; // TODO: Check if the svg element is at the right place...

  /**
   * Sets the element associated with the element.
   *
   * @param element     The element to set.
   */
  abstract set svgElement(element: any);

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
    return this.polygonsGroup.count * Config.MIN_AMOUNT;
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
    this.polygonsGroup.count = Math.ceil(amount / Config.MIN_AMOUNT);
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
    return this.polygonsGroup.selectionCount * Config.MIN_AMOUNT;
  }

  set selectedAmount(selectedAmount: number) {
    if (selectedAmount < 0) {
      selectedAmount = 0;
    }
    if (this.selectedAmount === selectedAmount) {
      return;
    }
    selectedAmount = Math.min(selectedAmount, this.amount);
    this.polygonsGroup.selectionCount = Math.ceil(selectedAmount / Config.MIN_AMOUNT);
  }

  get temporaryAmount(): number {
    return this.polygonsGroup.temporaryCount * Config.MIN_AMOUNT;
  }

  set temporaryAmount(temporaryAmount: number) {
    this.polygonsGroup.temporaryCount = Math.ceil(temporaryAmount / Config.MIN_AMOUNT);
  }

  abstract accept(visitor: BudgetElementVisitor);
}
