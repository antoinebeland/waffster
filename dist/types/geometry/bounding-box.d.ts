import { Point } from './point';
export declare class BoundingBox {
    position: Point;
    width: number;
    height: number;
    constructor(position?: Point, width?: number, height?: number);
    readonly x: number;
    readonly y: number;
    isInto(point: Point): boolean;
    toString(): string;
}
