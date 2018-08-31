import { BoundingBox } from './bounding-box';
import { Point } from './point';
import { Polygon } from './polygon';
export declare class Square implements Polygon {
    isSelected: boolean;
    isTemporary: boolean;
    private static _currentId;
    private readonly _boundingBox;
    private readonly _id;
    private _sideLength;
    private _points;
    private _position;
    constructor(position: Point, sideLength: number);
    readonly boundingBox: BoundingBox;
    readonly id: number;
    readonly points: Point[];
    position: Point;
    sideLength: number;
    private update;
}
