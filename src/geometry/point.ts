/**
 * Defines a point.
 */
export interface Point {
  /**
   * The X coordinate of the point.
   */
  x: number;

  /**
   * The Y coordinate of the point.
   */
  y: number;
}

/**
 * Validated if the specified instance is a Point.
 *
 * @param point         The point to validate.
 * @return {boolean}    TRUE is the specified element is an instance of the Point interface. FALSE otherwise.
 */
export function isPoint(point: any): point is Point {
  return point !== undefined &&
      point.x !== undefined && !isNaN(point.x) &&
      point.y !== undefined && !isNaN(point.y);
}
