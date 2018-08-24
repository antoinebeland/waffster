import { BoundingBox } from './bounding-box';
import { Point } from './point';

/**
 * Defines the base methods of a polygon.
 */
export interface Polygon {
  /**
   * The bounding box associated with the polygon.
   */
  readonly boundingBox: BoundingBox;

  /**
   * The unique ID of the polygon.
   */
  readonly id: number;

  /**
   * Indicates if the polygon is selected.
   */
  isSelected: boolean;

  /**
   * Indicates if the polygon is temporary.
   */
  isTemporary: boolean;

  /**
   * The points associated with the polygon in clockwise order.
   */
  readonly points: Point[];

  /**
   * The top-left position of the polygon.
   */
  position: Point;
}
