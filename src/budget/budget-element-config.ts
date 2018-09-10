/**
 * Defines the possible types for a budget element.
 */
export enum BudgetElementType {
  DEFICIT = 'deficit',
  INCOME = 'income',
  SPENDING = 'spending'
}

/**
 * ¸Defines a feedback message for a budget element.
 */
export interface FeedbackMessage {
  /**
   * An arrow of two elements that represents an interval.
   */
  interval: number[];

  /**
   * The message associated with the interval.
   */
  message: string;
}

/**
 * Validates if the specified element is a feedback message.
 *
 * @param feedbackMessage   The element to validate.
 * @returns {boolean}       TRUE if the element is a feedback message. FALSE otherwise.
 */
function isFeedbackMessage(feedbackMessage: any): feedbackMessage is FeedbackMessage {
  return feedbackMessage && feedbackMessage.interval !== undefined && feedbackMessage.interval.length === 2 &&
    !isNaN(feedbackMessage.interval[0]) && !isNaN(feedbackMessage.interval[1]) &&
    feedbackMessage.interval[0] <= feedbackMessage.interval[1] && feedbackMessage.message !== undefined;
}

/**
 * Defines the configuration for a budget element.
 */
export interface BudgetElementConfig {
  /**
   * The name of the element.
   */
  name: string;

  /**
   * The description of the element.
   */
  description: string;

  /**
   * The type of the element.
   */
  type: BudgetElementType;

  /**
   * The min amount of the element.
   */
  minAmount: number;

  /**
   * The feedback messages to use.
   */
  feedbackMessages: FeedbackMessage[];
}

/**
 * Validates if the specified element is a valid configuration.
 *
 * @param config        The configuration to validate.
 * @returns {boolean}   TRUE if the configuration is valid. FALSE otherwise.
 */
export function isBudgetElementConfig(config: any): config is BudgetElementConfig {
  return config && config.name !== undefined && config.descripton !== undefined && config.type !== undefined &&
    !isNaN(config.minAmount) && config.amount > 0 && config.feedbackMessages !== undefined &&
    config.feedbackMessages.every(f => isFeedbackMessage(f));
}
