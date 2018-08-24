import * as d3 from 'd3';

import { AbstractPolygonsGroup } from './abstract-polygons-group';
import { Point } from './point';
import { PolygonsGroupConfig, PolygonsGroupOrientation } from './polygons-group-configs';
import { Square } from './square';

/**
 * Defines a group of squares.
 */
export class SquaresGroup extends AbstractPolygonsGroup {
  private readonly _position: Point;
  private _count: number;
  private _squares: Square[];
  private _temporaryCount: number;

  /**
   * Initializes a new instance of the SquaresGroup class.
   *
   * @param count     The squares count of the group.
   * @param config    The parameters to use to initialize the group.
   */
  constructor(count: number, config: PolygonsGroupConfig) {
    super(config);
    this._count = count;
    this._position = { x: 0, y: 0 };
    this._squares = d3.range(this._startingPosition, this._count + this._startingPosition)
      .map(i => new Square(this.getSquarePosition(i), this._sideLength));
    this._temporaryCount = 0;
    this.updateBoundingBox();
  }

  /**
   * Gets the configuration of the group.
   *
   * @returns {PolygonsGroupConfig}         The configuration of the group.
   */
  get config(): PolygonsGroupConfig {
    return super.config;
  }

  /**
   * Sets the configuration of the group.
   *
   * @param {PolygonsGroupConfig} config    The configuration to set.
   */
  set config(config: PolygonsGroupConfig) {
    super.config = config;
    if (this._squares) {
      this._squares.forEach((square, i) => {
        square.position = this.getSquarePosition(i + this._startingPosition);
        square.sideLength = this._sideLength;
      });
      this.updateBoundingBox();
    }
  }

  /**
   * Gets the squares count.
   *
   * @returns {number}        The squares count.
   */
  get count(): number {
    return this._count;
  }

  /**
   * Sets the polygons count.
   *
   * @param {number} count    The polygons count to set.
   */
  set count(count: number) {
    if (this._count === count) {
      return;
    }
    if (count < 0) {
      throw new RangeError(`Invalid count specified (${count}).`);
    }
    if (this._temporaryCount !== 0) {
      throw new Error('You should not have temporary element before to set a new count.');
    }
    this.updateCount(this._count, count);
    this._count = count;
    this.updateBoundingBox();
  }

  /**
   * Gets the polygons associated with the group.
   *
   * @returns {Square[]}      A list of squares.
   */
  get polygons(): Square[] {
    return this._squares;
  }

  get temporaryCount(): number {
    return this._temporaryCount;
  }

  set temporaryCount(count: number) {
    if (this._temporaryCount === count) {
      return;
    }
    count = Math.max(-this._count, count);
    if (count >= 0) {
      if (this._temporaryCount <= 0) {
        this._temporaryCount = 0;
        this._squares.forEach(s => s.isTemporary = false);
      }
      this.updateCount(this._count + this._temporaryCount, this._count + count, true);
    } else {
      if (this._temporaryCount > 0) {
        this.updateCount(this._count + this._temporaryCount, this._count, true);
      }
      this._squares.forEach((s, i) => s.isTemporary = i >= this._count + count);
    }
    this._temporaryCount = count;
    this.updateBoundingBox();
  }

  /**
   * Reshapes the group based on the starting position specified.
   *
   * @param {number} startingPosition   The starting position to use. By default, the starting position is 0.
   */
  reshape(startingPosition = 0) {
    if (this._startingPosition === startingPosition) {
      return;
    }
    if (startingPosition < 0 || startingPosition >= this._maxCountPerLine) {
      throw new RangeError('Invalid starting position specified.');
    }
    const delta = this._startingPosition - startingPosition;
    const count = Math.min(Math.abs(delta), this._count);

    if (delta > 0) { // Add squares on the first line.
      const othersSquares = this._squares.slice(0, this._squares.length - count);
      const squaresToModify = this._squares.slice(this._squares.length - count);
      squaresToModify.forEach((square, i) => {
        square.position = this.getSquarePosition(i + startingPosition);
      });
      this._squares = squaresToModify.concat(othersSquares);
    } else { // Remove squares on the first line.
      const othersSquares = this._squares.slice(count);
      const squaresToModify = this._squares.slice(0, count);
      squaresToModify.forEach((square, i) => {
        square.position = this.getSquarePosition(i + startingPosition + othersSquares.length);
      });
      this._squares = othersSquares.concat(squaresToModify);
    }
    this._startingPosition = startingPosition;
    this.updateBoundingBox();
  }

  /**
   * Gets a square position.
   *
   * @param {number} index    The index of the square.
   * @returns {Point}         The position of square.
   */
  private getSquarePosition(index: number): Point {
    const currentPoint = {
      x: this._position.x,
      y: this._position.y
    };

    // If this is a change of line...
    if (Math.floor(index / this._maxCountPerLine) > 0) {
      const lineOffset = this._sideLength * Math.floor(index / this._maxCountPerLine);
      if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
        currentPoint.y += lineOffset;
      } else {
        currentPoint.x += lineOffset;
      }
    }
    const offset = this._sideLength * (index % this._maxCountPerLine);
    if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
      currentPoint.x += offset;
    } else {
      currentPoint.y += offset;
    }
    return currentPoint;
  }

  private updateCount(currentCount, newCount, isTemporary = false) {
    if (currentCount > newCount) { // Remove extra squares.
      this._squares = this._squares.slice(0, newCount);
    } else { // Add new squares.
      this._squares = this._squares.concat(
        d3.range(currentCount + this._startingPosition,
          newCount + this._startingPosition)
          .map(i => {
            const square = new Square(this.getSquarePosition(i), this._sideLength);
            square.isTemporary = isTemporary;
            return square;
          })
      );
    }
  }

  /**
   * Updates the bounding box.
   */
  private updateBoundingBox() {
    this._boundingBox = this.getBoundingBox({
      x: this._position.x,
      y: this._position.y
    });
    this.updateBoundary();
  }
}
