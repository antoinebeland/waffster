export declare class LayoutConfig {
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
}
export declare class GaugeConfig {
    barWidth: number;
    height: number;
    interval: number[];
    needleRadius: number;
    width: number;
}
export declare function isLayoutConfig(config: any): config is LayoutConfig;
export declare function isGaugeConfig(config: any): config is GaugeConfig;
