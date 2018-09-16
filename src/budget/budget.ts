import { descending } from 'd3-array';

import { Config } from '../config';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';

import { isBudgetConfig, BudgetAdjustment, BudgetConfig } from './budget-config';
import { BudgetElement } from './budget-element';
import { BudgetElementConfig, BudgetElementType } from './budget-element-config';
import { BudgetElementGroup } from './budget-element-group';
import { SimpleBudgetElement } from './simple-budget-element';

/**
 * The possible state of a budget.
 */
export enum BudgetState {
  BALANCED = 'balanced',
  DEFICIT = 'deficit',
  SURPLUS = 'surplus'
}

/**
 * The budget summary.
 */
export interface BudgetSummary {
  delta: number;
  incomesAmount: number;
  spendingsAmount: number;
  state: BudgetState;
}

/**
 * Defines a budget.
 */
export class Budget {
  readonly year: number;
  readonly adjustments: BudgetAdjustment[] = [];
  readonly incomes: BudgetElement[] = [];
  readonly spendings: BudgetElement[] = [];
  readonly minAmount: number;

  private static _amountStack = [];
  private readonly _polygonsGroupConfig: PolygonsGroupConfig;

  /**
   * Initializes a new instance of the Budget class.
   *
   * @param {BudgetConfig} budgetConfig                   The budget configuration to use to initialize a budget.
   * @param {number} [minAmount]                          The min amount to use. By default, the budget uses the min
   *                                                      amount specified in the Config class.
   * @param {PolygonsGroupConfig} [polygonsGroupConfig]   The configuration to use for the polygons group.
   */
  constructor(budgetConfig: BudgetConfig, minAmount: number = Config.MIN_AMOUNT,
              polygonsGroupConfig: PolygonsGroupConfig = Config.DEFAULT_POLYGONS_GROUP_CONFIG) {
    if (!isBudgetConfig(budgetConfig)) {
      throw new TypeError('Invalid configuration specified.');
    }
    if (minAmount <= 0) {
      throw new RangeError('The min amount must be greater than 0.');
    }
    this.minAmount = minAmount;
    this.year = budgetConfig.year;
    this._polygonsGroupConfig = polygonsGroupConfig;

    this.adjustments = budgetConfig.adjustments.map(a => {
      a.amount = Math.round(a.amount / minAmount) * minAmount;
      return a;
    });

    const initialize = (e, type, elements) => {
      if (e.children && e.children.length > 0) {
        const group = new BudgetElementGroup(this.getBudgetElementConfig(e, type), this._polygonsGroupConfig);
        e.children.forEach(c => this.initializeBudgetElement(c, type, group));
        elements.push(group);
      } else if (this.isAcceptableAmount(e.amount)) {
        elements.push(new SimpleBudgetElement(this.getBudgetElementConfig(e, type), e.amount,
          this._polygonsGroupConfig));
      }
      elements.sort((a, b) => descending(a.amount, b.amount));
    };
    budgetConfig.incomes.forEach(e => initialize(e, BudgetElementType.INCOME, this.incomes));
    budgetConfig.spendings.forEach(e => initialize(e, BudgetElementType.SPENDING, this.spendings));
  }

  /**
   * Gets the elements of the budgets sorted in descending order.
   *
   * @returns {BudgetElement[]}   An array that contains the incomes and the spendings of the budget.
   */
  get elements(): BudgetElement[] {
   return this.incomes.concat(this.spendings)
     .sort((a, b) => descending(a.amount, b.amount));
  }

  /**
   * Gets the the budget summary (include the temporary amounts).
   *
   * @returns {BudgetSummary}       The summary of the budget.
   */
  get summary(): BudgetSummary {
    let incomesAmount = this.incomes.reduce(
      (total, income) => total + income.amount + income.temporaryAmount, 0);
    let spendingsAmount = this.spendings.reduce(
      (total, spending) => total + spending.amount + spending.temporaryAmount, 0);

    this.adjustments.forEach(a => {
      switch (a.type) {
        case BudgetElementType.INCOME:
          incomesAmount += a.amount;
          break;
        case BudgetElementType.SPENDING:
          spendingsAmount += a.amount;
      }
    });

    const delta = incomesAmount - spendingsAmount;
    let state = BudgetState.BALANCED;
    if (delta < 0) {
      state = BudgetState.DEFICIT;
    } else if (delta > 0) {
       state = BudgetState.SURPLUS;
    }
    return {
      delta: delta,
      incomesAmount: incomesAmount,
      spendingsAmount: spendingsAmount,
      state: state
    };
  }

  /**
   * Gets the element associated with the name specified.
   *
   * @param {string} name         The name associated with the element to retrieve.
   * @returns {BudgetElement}     The budget element associated with the name specified.
   *                              If the name specified doesn't match with an element,
   *                              UNDEFINED is returned.
   */
  getElementByName(name: string): BudgetElement {
    function getElement(e) {
      if (e.name === name) {
        return e;
      }
      if (e instanceof BudgetElementGroup && e.children && e.children.length !== 0) {
        let element = undefined;
        e.children.some(c => {
          element = getElement(c);
          return element;
        });
        return element;
      }
    }

    let element = undefined;
    this.elements.some(e => {
      element = getElement(e);
      return element;
    });
    return element;
  }

  /**
   * Gets the budget element configuration of the specified element.
   *
   * @param element                     The element to use to retrieved the configuration associated.
   * @param {BudgetElementType} type    The type of the element.
   * @returns {BudgetElementConfig}     The configuration associated with the element specified.
   */
  private getBudgetElementConfig(element: any, type: BudgetElementType): BudgetElementConfig {
    return {
      description: element.description || '',
      feedbackMessages: element.feedback || [],
      isMutable: element.isMutable !== undefined ? element.isMutable : true,
      minAmount: this.minAmount,
      name: element.name,
      type: type,
    };
  }

  /**
   * Initialize a budget element.
   *
   * @param data                            The data to use to initialize the element.
   * @param {BudgetElementType} type        The budget element type to use.
   * @param {BudgetElementGroup} parent     The parent of the element to initialize.
   */
  private initializeBudgetElement(data: any, type: BudgetElementType, parent: BudgetElementGroup) {
    if (data.children && data.children.length > 0) {
      Budget._amountStack.push(0);
      const group = new BudgetElementGroup(this.getBudgetElementConfig(data, type), this._polygonsGroupConfig);
      data.children.forEach(c => this.initializeBudgetElement(c, type, group));

      const totalAmount = Budget._amountStack[Budget._amountStack.length - 1];
      if (parent) {
       if (this.isAcceptableAmount(group.amount) && group.children.length > 1) {
         parent.addChild(group);
       } else if (this.isAcceptableAmount(totalAmount)) {
         parent.addChild(new SimpleBudgetElement(this.getBudgetElementConfig(data, type), totalAmount,
           this._polygonsGroupConfig));
       }
      }
      Budget._amountStack.pop();
      if (Budget._amountStack.length > 0) {
        Budget._amountStack[Budget._amountStack.length - 1] += totalAmount;
      }
    } else if (parent && this.isAcceptableAmount(data.amount)) {
      if (Budget._amountStack.length > 0) {
        Budget._amountStack[Budget._amountStack.length - 1] += data.amount;
      }
      parent.addChild(new SimpleBudgetElement(this.getBudgetElementConfig(data, type), data.amount,
        this._polygonsGroupConfig));
    }
  }

  /**
   * Indicates if the specified amount is acceptable based on the min amount of the budget.
   *
   * @param {number} amount     The amount to validate.
   * @returns {boolean}         TRUE if the budget is acceptable. FALSE otherwise.
   */
  private isAcceptableAmount(amount: number) {
    return Math.round(amount / this.minAmount) > 0;
  }
}
