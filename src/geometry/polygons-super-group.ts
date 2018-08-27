import * as d3 from 'd3';

import { AbstractPolygonsGroup } from './abstract-polygons-group';
import { Polygon } from './polygon';
import { PolygonsGroupConfig, PolygonsGroupOrientation } from './polygons-group-configs';

enum PolygonsSuperGroupState {
  COLLAPSED,
  EXPANDED
}

export class PolygonsSuperGroup extends AbstractPolygonsGroup {
  private readonly _children: AbstractPolygonsGroup[];
  private _spacing: number;
  private _state: PolygonsSuperGroupState;

  /**
   * Initializes a new instance of the PolygonsSuperGroup class.
   *
   * @param {PolygonsGroupConfig} config      The configuration to use.
   * @param {number} spacing                  The spacing to use between groups.
   */
  constructor(config: PolygonsGroupConfig, spacing: number) {
    super(config);
    this._children = [];
    this._spacing = spacing;
    this._state = PolygonsSuperGroupState.COLLAPSED;
  }

  /**
   * Gets the polygons count of the super group.
   *
   * @returns {number}              The polygons count into the super group.
   */
  get count(): number {
    return this._children.reduce((total, child) => total + child.count, 0);
  }

  /**
   * Sets the polygons count into the super group.
   *
   * @param {number} count          The polygons count to set.
   */
  set count(count: number) {
    if (this.count === count) {
      return;
    }
    if (count < 0) {
      throw new RangeError('Invalid count specified.');
    }
    if (this.temporaryCount !== 0) {
      throw new Error('You should not have temporary element before to set a new count.');
    }
    let diffCount = 0;
    const children = this.children;
    const currentCount = this.count;
    children.forEach(c => {
      let ratio;
      if (currentCount === 0) {
        ratio = 1 / children.length;
      } else {
        ratio = c.count / currentCount;
      }
      const countToApply = Math.round(ratio * count);
      diffCount += Math.abs(c.count - countToApply);
      c.count = countToApply;
    });
    // Adjust the total count to correct the imprecision of the ratio computations.
    const delta = count - currentCount;
    if (children.length > 0 && Math.abs(delta) !== diffCount) {
      let adjustment = (delta > 0 ? 1 : -1 ) * (Math.abs(delta) - diffCount);
      children.some(c => {
        let countToApply = c.count + adjustment;
        if (countToApply < 0) {
          countToApply = 0;
        }
        if (adjustment < 0) {
          adjustment += c.count - countToApply;
        }
        c.count = countToApply;
        return adjustment >= 0;
      });
    }
  }

  /**
   * Gets the children associated with the super group.
   *
   * @returns {Polygon[]}     The children of the super group.
   */
  get polygons(): Polygon[] {
    return [].concat.apply([], this.children.map(c => c.polygons));
  }

  get temporaryCount(): number {
    return this._children.reduce((total, child) => total + child.temporaryCount, 0);
  }

  set temporaryCount(count: number) {
    const temporaryCount = this.temporaryCount;
    if (this.temporaryCount === count) {
      return;
    }
    const children = this.children;
    if (children.length <= 0) {
      return;
    }
    count = Math.max(-this.count, count);

    // Create new elements
    if (count > 0) {
      if (this.count > 0) {
        children[children.length - 1].temporaryCount = count; // Put temporary element to last element of the group.
      } else {
        children[0].temporaryCount = count; // If there is no element, put it in the first.
      }
    } else {
      if (this.temporaryCount > 0) {
        children.forEach(c => c.temporaryCount = 0);
      }
      let remainingCount = count;
      for (let i = children.length - 1; i >= 0; --i) {
        const child = children[i];
        if (Math.abs(remainingCount) - child.count >= 0) {
          child.temporaryCount = -child.count;
          remainingCount += child.count;
        } else {
          child.temporaryCount = remainingCount;
          remainingCount = 0;
        }
      }
    }
  }

  /**
   * Gets the children associated with the super group.
   *
   * @returns {AbstractPolygonsGroup[]}     The children of the super group.
   */
  get children(): AbstractPolygonsGroup[] {
    return this._children.sort((a, b) => d3.descending(a.count, b.count));
  }

  /**
   * Gets the spacing to use between the groups.
   *
   * @returns {number}            The spacing used between the groups.
   */
  get spacing(): number {
    return this._spacing;
  }

  /**
   * Sets the spacing to use between the groups.
   *
   * @param {number} spacing      The spacing to use.
   */
  set spacing(spacing: number) {
    this._spacing = spacing;
  }

  reshape(startingPosition = 0) {
    this._startingPosition = startingPosition;
    this.update();
  }

  addGroup(group: AbstractPolygonsGroup) {
    this._children.push(group);
  }

  removeGroup(group: AbstractPolygonsGroup) {
    this._children.splice(this._children.findIndex(c => c === group), 1);
  }

  collapse() {
    this._state = PolygonsSuperGroupState.COLLAPSED;
  }

  expand() {
    this._state = PolygonsSuperGroupState.EXPANDED;
  }

  update() {
    const children = this.children;
    switch (this._state) {
      case PolygonsSuperGroupState.COLLAPSED: {
        let count = this._startingPosition;
        let cumulative = 0;
        children.forEach((c, i) => {
          const adjustment = (count % this._maxCountPerLine === 0 || i === 0) ? 0 : this._sideLength;
          c.translate(cumulative - adjustment);
          c.reshape(count % this._maxCountPerLine);
          count += c.count;

          if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
            cumulative += c.boundingBox.height - adjustment;
          } else {
            cumulative += c.boundingBox.width - adjustment;
          }
        });
        break;
      }
      case PolygonsSuperGroupState.EXPANDED: {
        this._startingPosition = 0;
        let cumulative = 0;
        children.forEach(c => {
          c.translate(cumulative);
          c.reshape(0);

          if (this._orientation === PolygonsGroupOrientation.HORIZONTAL) {
            cumulative += c.boundingBox.height + this._spacing;
          } else {
            cumulative += c.boundingBox.width + this._spacing;
          }
        });
      }
    }
    this.updateBoundingBox();
  }

  private updateBoundingBox() {
    const count = this.count + Math.max(0, this.temporaryCount);
    const maximums = {
      height: this._sideLength,
      width: this._sideLength
    };
    if (count > 0) {
      this._children.forEach(c => {
        let height = c.translation.y + c.boundingBox.y + c.boundingBox.height;
        let width = c.translation.x + c.boundingBox.x + c.boundingBox.width;
        if (maximums.height < height) {
          maximums.height = height;
        }
        if (maximums.width < width) {
          maximums.width = width;
        }
      });
    }
    this._boundingBox.height = maximums.height;
    this._boundingBox.width = maximums.width;
    this.updateBoundary();
  }
}
