export declare class LayoutConfig {
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
export declare function isLayoutConfig(config: any): config is LayoutConfig;
