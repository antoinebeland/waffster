export declare enum PolygonsGroupOrientation {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}
export interface PolygonsGroupConfig {
    maxCountPerLine: number;
    orientation?: PolygonsGroupOrientation;
    sideLength: number;
    startingPosition?: number;
}
export declare function isPolygonsGroupConfig(config: any): boolean;
