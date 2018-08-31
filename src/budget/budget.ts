import { descending } from 'd3-array';

import { Config } from '../config';

import { isBudgetConfig, BudgetConfig } from './budget-config';
import { BudgetElement, BudgetElementType } from './budget-element';
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
  readonly incomes: BudgetElement[] = [];
  readonly spendings: BudgetElement[] = [];
  readonly minAmount: number;

  private static _amountStack = [];

  /**
   * Initializes a new instance of the Budget class.
   *
   * @param {BudgetConfig} budgetConfig   The budget configuration to use to initialize a budget.
   * @param {number} [minAmount]          The min amount to use. By default, the budget uses the min amount specified
   *                                      in the Config class.
   */
  constructor(budgetConfig: BudgetConfig, minAmount: number = Config.MIN_AMOUNT) {
    if (!isBudgetConfig(budgetConfig)) {
      throw new TypeError('Invalid configuration specified.');
    }
    if (minAmount <= 0) {
      throw new RangeError('The min amount must be greater than 0.');
    }
    this.minAmount = minAmount;
    this.year = budgetConfig.year;

    const initialize = (e, type, elements) => {
      if (e.children && e.children.length > 0) {
        const group = new BudgetElementGroup(e.name, e.description || '', type);
        e.children.forEach(c => this.initializeBudgetElement(c, type, group));
        elements.push(group);
      } else if (this.isAcceptableAmount(e.amount)) {
        elements.push(new SimpleBudgetElement(e.amount, e.name, e.description || '', type));
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
    const incomesAmount = this.incomes.reduce(
      (total, income) => total + income.amount + income.temporaryAmount, 0);
    const spendingsAmount = this.spendings.reduce(
      (total, spending) => total + spending.amount + spending.temporaryAmount, 0);
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
   * Initialize a budget element.
   *
   * @param data                            The data to use to initialize the element.
   * @param {BudgetElementType} type        The budget element type to use.
   * @param {BudgetElementGroup} parent     The parent of the element to initialize.
   */
  private initializeBudgetElement(data: any, type: BudgetElementType, parent: BudgetElementGroup) {
    if (data.children && data.children.length > 0) {
      Budget._amountStack.push(0);
      const group = new BudgetElementGroup(data.name, data.description || '', type);
      data.children.forEach(c => this.initializeBudgetElement(c, type, group));

      const totalAmount = Budget._amountStack[Budget._amountStack.length - 1];
      if (parent) {
       if (this.isAcceptableAmount(group.amount) && group.children.length > 1) {
         parent.addChild(group);
       } else if (this.isAcceptableAmount(totalAmount)) {
         parent.addChild(new SimpleBudgetElement(totalAmount, data.name, data.description || '', type));
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
      parent.addChild(new SimpleBudgetElement(data.amount, data.name, data.description || '', type));
    }
  }

  private isAcceptableAmount(amount: number) {
    return Math.round(amount / this.minAmount) > 0;
  }
}
