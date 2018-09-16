import { AbstractPolygonsGroup } from './abstract-polygons-group';
import { PolygonsGroupConfig } from './polygons-group-configs';
import { Square } from './square';
export declare class SquaresGroup extends AbstractPolygonsGroup {
    isMutable: boolean;
    private readonly _position;
    private _count;
    private _squares;
    private _temporaryCount;
    constructor(count: number, config: PolygonsGroupConfig);
    config: PolygonsGroupConfig;
    count: number;
    readonly invariableCount: number;
    readonly polygons: Square[];
    temporaryCount: number;
    reshape(startingPosition?: number): void;
    private getSquarePosition;
    private updateCount;
    private updateBoundingBox;
}
