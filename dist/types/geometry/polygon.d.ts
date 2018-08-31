import { BoundingBox } from './bounding-box';
import { Point } from './point';
export interface Polygon {
    readonly boundingBox: BoundingBox;
    readonly id: number;
    isSelected: boolean;
    isTemporary: boolean;
    readonly points: Point[];
    position: Point;
}
