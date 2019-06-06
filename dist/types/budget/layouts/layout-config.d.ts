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
    countPerLine?: number;
    legend?: {
        minAmount: number;
        sideLength: number;
    };
    isAmountsDisplayed?: boolean;
    isGaugeDisplayed?: boolean;
    locale?: string;
    gaugeConfig?: GaugeConfig;
    size?: Size;
}
export declare class GaugeConfig {
    barWidth: number;
    height: number;
    interval: number[];
    needleRadius: number;
    width: number;
}
export declare class Size {
    height: number;
    width: number;
}
export declare function isLayoutConfig(config: any): config is LayoutConfig;
export declare function isGaugeConfig(config: any): config is GaugeConfig;
export declare function isSize(size: any): size is Size;
