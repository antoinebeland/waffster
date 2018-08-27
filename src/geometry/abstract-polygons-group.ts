import { BoundingBox } from './bounding-box';
import { Point } from './point';
import { Polygon } from './polygon';
import { isPolygonsGroupConfig, PolygonsGroupConfig, PolygonsGroupOrientation } from './polygons-group-configs';
import { Translation } from './translation';

/**
 * Defines the base of a polygons group.
 */
export abstract class AbstractPolygonsGroup {
  private readonly _translation: Translation;
  private _boundary = [];
  private _selectionCount = 0;

  // TODO: Put variable private and use public accessors.
  protected _boundingBox: BoundingBox;
  protected _maxCountPerLine: number;
  protected _orientation: PolygonsGroupOrientation;
  protected _sideLength: number;
  protected _startingPosition;

  protected constructor(config: PolygonsGroupConfig) {
    this.config = config;
    this._boundary = [];
    this._boundingBox = new BoundingBox();
    this._translation = { x: 0, y: 0 };
  }

  /**
   * Gets the polygons count of the group.
   *
   * @returns {number}              The polygons count into the group.
   */
  abstract get count(): number;

  /**
   * Sets the polygons count into the group.
   *
   * @param {number} count          The polygons count to set.
   */
  abstract set count(count: number);

  /**
   * Gets the polygons of the group.
   *
   * @returns {Polygon[]}     The polygons of the group.
   */
  abstract get polygons(): Polygon[];

  abstract get temporaryCount(): number;

  abstract set temporaryCount(count: number);

  /**
   * Gets the boundary of the polygons group.
   */
  get boundary(): Point[] {
    return this._boundary;
  }

  /**
   * Gets the bounding box associated with the group.
   *
   * @returns {BoundingBox}                 The bounding box of the group.
   */
  get boundingBox(): BoundingBox {
    return this._boundingBox;
  }

  /**
   * Gets the configuration of the group.
   *
   * @returns {PolygonsGroupConfig}         The configuration of the group.
   */
  get config(): PolygonsGroupConfig {
    return this.getBaseConfig();
  }

  /**
   * Sets the configuration of the group.
   *
   * @param {PolygonsGroupConfig} config    The configuration to set.
   */
  set config(config: PolygonsGroupConfig) {
    this.setBaseConfig(config);
  }

  get selectionCount(): number {
    return this._selectionCount;
  }

  set selectionCount(count: number) {
    if (count < 0 || count > this.count) {
      throw new TypeError('The specified count is invalid');
    }
    if (this._selectionCount === count) {
      return;
    }
    this._selectionCount = count;
    const polygons = this.polygons;
    for (let max = this.polygons.length - 1, i = max; i >= 0; --i) {
      polygons[i].isSelected = max - i < count;
    }
  }

  /**
   * Gets the translation associated with the group.
   *
   * @returns {Translation}         The translation of the group.
   */
  get translation(): Translation {
    return this._translation;
  }

  /**
   * Reshapes the group based on the starting position.
   *
   * @param [startingPosition]    The starting position to use to reshape the group.
   *                              By default, the starting position is 0.
   */
  abstract reshape(startingPosition?);

  /**
   * Translates the group of the offset specified.
   *
   * @param {number} offset       The offset to use to do translation.
   */
  translate(offset: number) {
    if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
      this._translation.x = 0;
      this._translation.y = offset;
    } else {
      this._translation.x = offset;
      this._translation.y = 0;
    }
  }

  protected getBaseConfig(): PolygonsGroupConfig {
    return {
      maxCountPerLine: this._maxCountPerLine,
      orientation: this._orientation,
      sideLength: this._sideLength,
      startingPosition: this._startingPosition
    };
  }

  protected setBaseConfig(config: PolygonsGroupConfig) {
    if (!isPolygonsGroupConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._maxCountPerLine = config.maxCountPerLine;
    this._orientation = config.orientation || PolygonsGroupOrientation.HORIZONTAL;
    this._sideLength = config.sideLength;
    this._startingPosition = config.startingPosition || 0;
  }

  /**
   * Computes the boundary of a polygons group.
   */
  protected updateBoundary() {
    /* Boundary model
                 (1) *----->----* (2)
                     |          |
      (7) *----->----* (8)      |
          |                     |
          |             (4) *---* (3)
          |                 |
      (6) *--------<--------* (5)
     */
    const boundingBox = this.getBoundingBox({ x: 0, y: 0 }, false);
    const count = this.count + this._startingPosition || 1;
    const padding = 0;
    const hasMoreThanSingleLine = Math.ceil(count / this._maxCountPerLine) > 1;
    this._boundary = [];

    if (hasMoreThanSingleLine) {
      if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
        // Point (1)
        this._boundary.push({
          x: boundingBox.x + this._startingPosition * this._sideLength - padding,
          y: boundingBox.y - padding
        });
      } else {
        // Point (1)
        this._boundary.push({
          x: boundingBox.x - padding,
          y: boundingBox.y + this._startingPosition * this._sideLength - padding
        });
      }
    } else {
      // Point (1)
      this._boundary.push({
        x: boundingBox.x - padding,
        y: boundingBox.y - padding
      });
    }

    // Point (2)
    this._boundary.push({
      x: boundingBox.x + boundingBox.width + padding,
      y: boundingBox.y - padding
    });

    if (count % this._maxCountPerLine !== 0 && hasMoreThanSingleLine) {
      if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
        // Point (3)
        this._boundary.push({
          x: boundingBox.x + boundingBox.width + padding,
          y: boundingBox.y + boundingBox.height - this._sideLength + padding
        });
        const width = (count % this._maxCountPerLine) * this._sideLength;

        // Point (4)
        this._boundary.push({
          x: boundingBox.x + width + padding,
          y: boundingBox.y + boundingBox.height - this._sideLength + padding
        });
        // Point (5)
        this._boundary.push({
          x: boundingBox.x + width + padding,
          y: boundingBox.y + boundingBox.height + padding
        });
      } else {
        const height = (count % this._maxCountPerLine) * this._sideLength;

        // Point (3)
        this._boundary.push({
          x: boundingBox.x + boundingBox.width + padding,
          y: boundingBox.y + height + padding
        });
        // Point (4)
        this._boundary.push({
          x: boundingBox.x + boundingBox.width - this._sideLength + padding,
          y: boundingBox.y + height + padding
        });
        // Point (5)
        this._boundary.push({
          x: boundingBox.x + boundingBox.width - this._sideLength + padding,
          y: boundingBox.y + boundingBox.height + padding
        });
      }
    } else {
      // Point (5)
      this._boundary.push({
        x: boundingBox.x + boundingBox.width + padding,
        y: boundingBox.y + boundingBox.height + padding
      });
    }
    // Point (6)
    this._boundary.push({
      x: boundingBox.x - padding,
      y: boundingBox.y + boundingBox.height + padding
    });
    if (this._startingPosition !== 0 && hasMoreThanSingleLine) {
      if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
        // Point (7)
        this._boundary.push({
          x: boundingBox.x - padding,
          y: boundingBox.y + this._sideLength - padding
        });
        // Point (8)
        this._boundary.push({
          x: boundingBox.x + this._startingPosition * this._sideLength - padding,
          y: boundingBox.y + this._sideLength - padding
        });
      } else {
        // Point (7)
        this._boundary.push({
          x: boundingBox.x + this._sideLength - padding,
          y: boundingBox.y - padding
        });
        // Point (8)
        this._boundary.push({
          x: boundingBox.x + this._sideLength - padding,
          y: boundingBox.y + this._startingPosition * this._sideLength - padding
        });
      }
    }
  }

  protected getBoundingBox(position: { x, y }, isIncludedTemporaryCount = true) {
    let count = this.count;
    if (isIncludedTemporaryCount && this.temporaryCount > 0) {
      count += this.temporaryCount;
    }
    let countPerLine = this._maxCountPerLine;
    if (this.count > 0 && (this._startingPosition + count) / this._maxCountPerLine <= 1) {
      countPerLine = count;
      const offset = this._startingPosition * this._sideLength;
      if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
        position.x += offset;
      } else {
        position.y += offset;
      }
    }
    const lineLength = (count > 0) ? countPerLine * this._sideLength : this._sideLength;
    const columnLength = (count > 0)
      ? Math.ceil((this._startingPosition + count) / this._maxCountPerLine) * this._sideLength : this._sideLength;

    if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
      return new BoundingBox(position, lineLength, columnLength);
    }
    return new BoundingBox(position, columnLength, lineLength);
  }
}
