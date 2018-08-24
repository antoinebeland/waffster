import { BudgetElement } from './budget-element';

/**
 * Defines a budget element configuration
 */
interface BudgetElementConfig {
  amount?: number;
  children?: BudgetElement[];
  name: string;
}

/**
 * Defines a budget configuration.
 */
export interface BudgetConfig {
  incomes: BudgetElementConfig[];
  spendings: BudgetElementConfig[];
  year: number;
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
  return !isNaN(budgetConfig.year) && budgetConfig.incomes.length > 0 &&
    budgetConfig.incomes.every(s => isBudgetElement(s)) &&
    budgetConfig.spendings.length > 0 &&
    budgetConfig.spendings.every(s => isBudgetElement(s));
}
