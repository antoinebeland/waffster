import { AbstractPolygonsGroup } from '../geometry/abstract-polygons-group';
import { Formatter } from '../utils/formatter';
import { D3Selection } from '../utils/types';

import {
  isBudgetElementConfig,
  BudgetElementConfig,
  BudgetElementType,
  FeedbackMessage
} from './budget-element-config';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';

/**
 * Defines an abstract budget element.
 */
export abstract class BudgetElement {
  /**
   * The ID of the element.
   */
  readonly id: string;

  /**
   * The name of the element.
   */
  readonly name: string;

  /**
   * The description of the element.
   */
  readonly description: string;

  /**
   * The element type.
   */
  readonly type: BudgetElementType;

  /**
   * The parent of the element.
   */
  parent: BudgetElement;

  /**
   * Indicates if the element is hovered over.
   */
  isHovered: boolean;

  protected _minAmount: number;
  protected _activeLevel = 0;
  protected _level = 0;

  private _feedbackMessages: FeedbackMessage[];

  /**
   * Initializes a new instance of the BudgetElement class.
   *
   * @param {BudgetElementConfig} config    The configuration to use.
   */
  protected constructor(config: BudgetElementConfig) {
    if (!isBudgetElementConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this.id = Formatter.formatId(config.name);
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this._minAmount = config.minAmount;
    this._feedbackMessages = config.feedbackMessages;
  }

  /**
   * Gets the active level.
   *
   * @returns {number} The active level of the element.
   */
  abstract get activeLevel(): number;

  /**
   * Sets the active level of the element.
   *
   * @param {number} level     The level to set as active.
   */
  abstract set activeLevel(level: number);

  /**
   * Indicates if the element has the focus.
   *
   * @returns {boolean} TRUE if the element has the focus. FALSE otherwise.
   */
  abstract get hasFocus(): boolean;

  /**
   * Sets if the element has the focus or not.
   *
   * @param {boolean} hasFocus   TRUE if the element must have the focus. FALSE otherwise.
   */
  abstract set hasFocus(hasFocus: boolean);

  /**
   * Gets the initial amount of the element.
   *
   * @returns {number} The initial amount of the element.
   */
  abstract get initialAmount(): number;

  /**
   * Gets the level of the element.
   *
   * @return {number} The level of the element.
   */
  abstract get level(): number;

  /**
   * Sets the level of the element.
   *
   * @param {number} level    The level to set.
   */
  abstract set level(level: number);

  /**
   * Gets the polygons group associated with the element.
   *
   * @returns {AbstractPolygonsGroup} The polygons group associated with the element.
   */
  abstract get polygonsGroup(): AbstractPolygonsGroup;

  /**
   * Gets the D3 selection associated with the element.
   *
   * @returns {D3Selection} The D3 selection associated.
   */
  abstract get svgElement(): D3Selection;

  /**
   * Sets the D3 selection  associated with the element.
   *
   * @param {D3Selection} element     The D3 selection to use.
   */
  abstract set svgElement(element: D3Selection);

  /**
   * Gets the amount of the element.
   *
   * @returns {number} The current amount of the element.
   */
  get amount(): number {
    return this.polygonsGroup.count * this._minAmount;
  }

  /**
   * Sets the amount of the element.
   *
   * @param {number} amount   The amount to set.
   */
  set amount(amount: number) {
    if (!this.isMutable) {
      throw new Error('Impossible to change the amount associated with the element.');
    }
    if (amount < 0) {
      throw new TypeError('Invalid amount specified.');
    }
    this.polygonsGroup.count = Math.ceil(amount / this._minAmount);
  }

  /**
   * Gets the feedback message associated with the current amount of the element.
   *
   * @returns {string} The message associated with the current amount of the element.
   */
  get feedbackMessage(): string {
    const initialAmount = this.initialAmount;
    if (initialAmount === 0) {
      return '';
    }
    const percent = Math.round(this.amount / initialAmount * 100);
    const feedback = this._feedbackMessages.find(f => f.interval[0] <= percent && f.interval[1] >= percent);
    let message = feedback ? feedback.message : '';
    if (!feedback && this.parent !== undefined) {
      message = this.parent.feedbackMessage;
    }
    return message;
  }

  /**
   * Indicates if the current element is active.
   *
   * @return {boolean} TRUE if the current element is active. FALSE otherwise.
   */
  get isActive(): boolean {
    return this._level === this.activeLevel;
  }

  /**
   * Indicates if the amount associated with the element can be modified.
   *
   * @returns {boolean} TRUE if the amount can be modified. FALSE otherwise.
   */
  get isMutable(): boolean {
    return this.polygonsGroup.isMutable;
  }

  /**
   * Sets if the amount of the element can be modified or not.
   *
   * @param {boolean} isMutable   TRUE if the amount can be modified. FALSE otherwise.
   */
  set isMutable(isMutable: boolean) {
    this.polygonsGroup.isMutable = isMutable;
  }

  /**
   * Gets the root element of the current element.
   *
   * @returns {BudgetElement} The root element of the current element. If there is no root, the current element is
   *                          returned.
   */
  get root(): BudgetElement {
    let element: BudgetElement = this;
    while (element.parent !== undefined) {
      element = element.parent;
    }
    return element;
  }

  /**
   * Gets the amount selected for the element.
   *
   * @returns {number} The selected amount of the element.
   */
  get selectedAmount(): number {
    return this.polygonsGroup.selectionCount * this._minAmount;
  }

  /**
   * Sets the selected amount for the element.
   *
   * @param {number} selectedAmount    The amount to select in the element. The amount must be positive or equal
   *                                   to zero.
   */
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

  /**
   * Gets the temporary amount of the element.
   *
   * @returns {number} The temporary amount of the element.
   */
  get temporaryAmount(): number {
    return this.polygonsGroup.temporaryCount * this._minAmount;
  }

  /**
   * Sets the temporary amount of the element.
   *
   * @param {number} temporaryAmount   The temporary amount to set.
   */
  set temporaryAmount(temporaryAmount: number) {
    this.polygonsGroup.temporaryCount = Math.ceil(temporaryAmount / this._minAmount);
  }

  /**
   * Accepts the visitor.
   *
   * @param {BudgetElementVisitor} visitor   The visitor to use.
   */
  abstract accept(visitor: BudgetElementVisitor);

  /**
   * Resets the element to the initial amount.
   */
  abstract reset();
}
