export class LayoutConfig {
  amountTextHeight: number;
  amountTextHeightY: number;
  averageCharSize: number;
  horizontalMinSpacing: number;
  horizontalPadding: number;
  polygonLength: number;
  titleLineHeight: number;
  transitionDuration: number;
  verticalMinSpacing: number;
  verticalPadding: number;
  isAmountsDisplayed?: boolean;
  isGaugeDisplayed?: boolean;
  gaugeConfig?: GaugeConfig;
  size?: Size;
}

export class GaugeConfig {
  barWidth: number;
  height: number;
  interval: number[];
  needleRadius: number;
  width: number;
}

export class Size {
  height: number;
  width: number;
}

/* tslint:disable:cyclomatic-complexity */
export function isLayoutConfig(config: any): config is LayoutConfig {
  return config && !isNaN(config.amountTextHeight) && config.amountTextHeight >= 0 &&
    !isNaN(config.amountTextHeightY) && config.amountTextHeightY >= 0 &&
    !isNaN(config.averageCharSize) && config.averageCharSize >= 0 &&
    !isNaN(config.horizontalMinSpacing) && config.horizontalMinSpacing >= 0 &&
    !isNaN(config.horizontalPadding) && config.horizontalPadding >= 0 &&
    !isNaN(config.polygonLength) && config.polygonLength > 0 &&
    !isNaN(config.titleLineHeight) && config.titleLineHeight >= 0 &&
    !isNaN(config.transitionDuration) && config.transitionDuration >= 0 &&
    !isNaN(config.verticalMinSpacing) && config.verticalMinSpacing >= 0 &&
    !isNaN(config.verticalPadding) && config.verticalPadding >= 0 &&
    config.isGaugeDisplayed === false || isGaugeConfig(config.gaugeConfig) &&
    !config.size || isSize(config.size);
}

export function isGaugeConfig(config: any): config is GaugeConfig {
  return config && !isNaN(config.barWidth) && config.barWidth >= 0 &&
    !isNaN(config.height) && config.height > 0 &&
    !isNaN(config.needleRadius) && config.needleRadius >= 0 &&
    !isNaN(config.width) && config.width > 0 &&
    config.interval && config.interval.length === 2 && !isNaN(config.interval[0]) &&
    !isNaN(config.interval[1]) && config.interval[0] <= config.interval[1];
}

export function isSize(size: any): size is Size {
  return size && !isNaN(size.height) && size.height >= 0 &&
    !isNaN(size.width) && size.width >= 0;
}
