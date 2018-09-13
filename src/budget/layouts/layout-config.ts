export class LayoutConfig {
  amountTextHeight: number;
  averageCharSize: number;
  horizontalMinSpacing: number;
  horizontalPadding: number;
  polygonLength: number;
  titleLineHeight: number;
  transitionDuration: number;
  verticalMinSpacing: number;
  verticalPadding: number;
  isGaugeDisplayed?: boolean;
}

export function isLayoutConfig(config: any): config is LayoutConfig {
  return !isNaN(config.amountTextHeight) && config.amountTextHeight > 0 &&
    !isNaN(config.averageCharSize) && config.averageCharSize > 0 &&
    !isNaN(config.horizontalMinSpacing) && config.horizontalMinSpacing >= 0 &&
    !isNaN(config.horizontalPadding) && config.horizontalPadding >= 0 &&
    !isNaN(config.polygonLength) && config.polygonLength > 0 &&
    !isNaN(config.titleLineHeight) && config.titleLineHeight > 0 &&
    !isNaN(config.transitionDuration) && config.transitionDuration >= 0 &&
    !isNaN(config.verticalMinSpacing) && config.verticalMinSpacing >= 0 &&
    !isNaN(config.verticalPadding) && config.verticalPadding >= 0;
}
