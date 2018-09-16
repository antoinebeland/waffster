import { BudgetElement } from './budget-element';
import { BudgetElementType } from './budget-element-config';

/**
 * Defines a budget adjustment configuration
 */
export interface BudgetAdjustment {
  amount: number;
  name: string;
  type: BudgetElementType;
}

/**
 * Defines a budget item configuration
 */
interface BudgetItemConfig {
  amount?: number;
  children?: BudgetElement[];
  isMutable?: boolean;
  name: string;
}

/**
 * Defines a budget configuration.
 */
export interface BudgetConfig {
  adjustments?: BudgetAdjustment[];
  incomes: BudgetItemConfig[];
  spendings: BudgetItemConfig[];
  year: number;
}

function isBudgetAdjustment(adjustment: any): adjustment is BudgetAdjustment {
  return !isNaN(adjustment.amount) && adjustment.name && adjustment.type && adjustment.type &&
    (<any>Object).values(BudgetElementType).includes(adjustment.type);
}

/**
 * Validates if the element specified is a budget element.
 *
 * @param budgetElement     The element to validate.
 * @returns {boolean}       TRUE if the element specified is a budget element. FALSE otherwise.
 */
function isBudgetElement(budgetElement: any): budgetElement is BudgetElement {
  let isValid = false;
  if (budgetElement.children && budgetElement.children.length > 0) {
    isValid = budgetElement.children.every(c => isBudgetElement(c));
  } else if (budgetElement.amount && !isNaN(budgetElement.amount)){
    isValid = true;
  }
  return isValid && budgetElement.name;
}

/**
 * Validates if the element specified is a valid budget configuration.
 *
 * @param budgetConfig      The configuration to validate.
 * @returns {boolean}       TRUE if the configuration specified is valid. FALSE otherwise.
 */
export function isBudgetConfig(budgetConfig: any): budgetConfig is BudgetConfig {
  return !isNaN(budgetConfig.year) &&
    budgetConfig.adjustments === undefined ||
    (budgetConfig.adjustments.length > 0 && budgetConfig.adjustments.every(a => isBudgetAdjustment(a))) &&
    budgetConfig.incomes.length > 0 && budgetConfig.incomes.every(s => isBudgetElement(s)) &&
    budgetConfig.spendings.length > 0 && budgetConfig.spendings.every(s => isBudgetElement(s));
}
