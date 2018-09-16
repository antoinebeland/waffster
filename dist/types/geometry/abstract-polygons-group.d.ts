import { BoundingBox } from './bounding-box';
import { Point } from './point';
import { Polygon } from './polygon';
import { PolygonsGroupConfig, PolygonsGroupOrientation } from './polygons-group-configs';
import { Translation } from './translation';
export declare abstract class AbstractPolygonsGroup {
    readonly id: number;
    protected _boundingBox: BoundingBox;
    protected _maxCountPerLine: number;
    protected _orientation: PolygonsGroupOrientation;
    protected _sideLength: number;
    protected _startingPosition: any;
    private static _currentId;
    private readonly _translation;
    private _boundary;
    private _selectionCount;
    protected constructor(config: PolygonsGroupConfig);
    abstract count: number;
    abstract isMutable: boolean;
    abstract readonly invariableCount: number;
    abstract readonly polygons: Polygon[];
    abstract temporaryCount: number;
    readonly boundary: Point[];
    readonly boundingBox: BoundingBox;
    config: PolygonsGroupConfig;
    selectionCount: number;
    readonly translation: Translation;
    abstract reshape(startingPosition?: any): any;
    translate(offset: number): void;
    protected getBaseConfig(): PolygonsGroupConfig;
    protected setBaseConfig(config: PolygonsGroupConfig): void;
    protected updateBoundary(): void;
    protected getBoundingBox(position: {
        x: any;
        y: any;
    }, isIncludedTemporaryCount?: boolean): BoundingBox;
}
