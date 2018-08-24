import { Point } from './point';

/**
 * Defines a bounding box.
 */
export class BoundingBox {
  position: Point;
  width: number;
  height: number;

  /**
   * Initializes a new instance of the BoundingBox class.
   *
   * @param position    The top-left position of the bounding box.
   * @param width       The width of the bounding box.
   * @param height      The height of the bounding box.
   */
  constructor(position: Point = { x: 0, y: 0 }, width = 0, height = 0) {
    if (width < 0) {
      throw new RangeError('Invalid width specified.');
    }
    if (height < 0) {
      throw new RangeError('Invalid height specified.');
    }
    this.position = position;
    this.width = width;
    this.height = height;
  }

  /**
   * Gets the X position of the bounding box.
   *
   * @return {number}   The X position.
   */
  get x(): number {
    return this.position.x;
  }

  /**
   * Gets the Y position of the bounding box.
   *
   * @return {number}   The Y position.
   */
  get y(): number {
    return this.position.y;
  }

  /**
   * Checks if the current point is into the bounding box.
   *
   * @param point       The point to check.
   * @return {boolean}  TRUE if the specified point is into the bounding box. FALSE otherwise.
   */
  isInto(point: Point): boolean {
    return this.position.x <= point.x && this.position.x + this.width >= point.x &&
      this.position.y <= point.y && this.position.y + this.height >= point.y;
  }

  /**
   * Converts the bounding box to a string representation.
   *
   * @return {string}   The string associated with the properties of the bounding box.
   */
  toString(): string {
    return `x: ${this.position.x} y: ${this.position.y} width: ${this.width} height: ${this.height}`;
  }
}
