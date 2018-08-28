import { range } from 'd3-array';

import { BoundingBox } from './bounding-box';
import { Point } from './point';
import { Polygon } from './polygon';

/**
 * Defines a square.
 */
export class Square implements Polygon {
  isSelected: boolean;
  isTemporary: boolean;

  private static _currentId = 0;

  private readonly _boundingBox: BoundingBox;
  private readonly _id: number;

  private _sideLength: number;
  private _points: Point[];
  private _position: Point;

  /**
   * Initializes a new instance of the Square class.
   *
   * @param position          The top-left position of the square.
   * @param sideLength        The side length of the square.
   */
  constructor(position: Point, sideLength: number) {
    if (sideLength < 0) {
      throw new RangeError('The specified side length is invalid.');
    }
    this._id = Square._currentId++;
    this._position = position;
    this._sideLength = sideLength;
    this._boundingBox = new BoundingBox(this._position, this._sideLength, this._sideLength);
    this.update();
  }

  /**
   * Gets the bounding box associated with the square.
   *
   * @return {BoundingBox}  The bounding box associated with the square.
   */
  get boundingBox(): BoundingBox {
    return this._boundingBox;
  }

  /**
   * Gets the unique ID associated with the square.
   *
   * @returns {number}     The ID of the square.
   */
  get id(): number {
    return this._id;
  }

  /**
   * Gets the points associated with the square in clockwise order.
   *
   * @return {Point[]}      The points in clockwise order.
   */
  get points(): Point[] {
    return this._points;
  }

  /**
   * Gets the top-left position of the square.
   *
   * @return {Point}        The top-left position of the square.
   */
  get position(): Point {
    return this._position;
  }

  /**
   * Sets the top-left position of the square.
   *
   * @param position        The new top-left position of the square.
   */
  set position(position: Point) {
    this._position = position;
    this._boundingBox.position.x = position.x;
    this._boundingBox.position.y = position.y;
    this.update();
  }

  /**
   * Gets the side length of the square.
   *
   * @returns {number}            The side length of the square.
   */
  get sideLength(): number {
    return this._sideLength;
  }

  /**
   * Sets the side length of the square.
   *
   * @param {number} sideLength   The side length to set.
   */
  set sideLength(sideLength: number) {
    if (sideLength < 0) {
      throw new RangeError('The specified side length is invalid.');
    }
    this._sideLength = sideLength;
    this._boundingBox.height = sideLength;
    this._boundingBox.width = sideLength;
    this.update();
  }

  /**
   * Updates the square points.
   */
  private update() {
    const center = {
      x: this._position.x + this._sideLength / 2,
      y: this._position.y + this._sideLength / 2
    };
    this._points = range(4).map(d => {
      const i = (d < 2) ? d % 2 : (d + 1) % 2;
      const j = Math.floor(d / 2);
      return {
        x: center.x - ((i === 0) ? 1 : -1) * this._sideLength / 2,
        y: center.y - ((j === 0) ? 1 : -1) * this._sideLength / 2
      };
    });
  }
}
