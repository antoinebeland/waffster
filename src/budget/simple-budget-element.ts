import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { SquaresGroup } from '../geometry/squares-group';
import { D3Selection } from '../utils/types';

import { BudgetElement } from './budget-element';
import { BudgetElementConfig } from './budget-element-config';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';

export class SimpleBudgetElement extends BudgetElement {
  readonly initialAmount: number;

  private readonly _group: SquaresGroup;
  private _hasFocus: boolean;
  private _svgElement: D3Selection;

  constructor(config: BudgetElementConfig, amount = 0, polygonsGroupConfig: PolygonsGroupConfig) {
    super(config);
    this.initialAmount = amount;
    this._group = new SquaresGroup(Math.round(amount / this._minAmount), polygonsGroupConfig);
    this._hasFocus = false;
    this.isMutable = config.isMutable;
  }

  get activeLevel(): number {
    return Math.min(this._level, this._activeLevel);
  }

  set activeLevel(level: number) {
    if (level < 0) {
      throw new RangeError('Invalid level specified.');
    }
    if (this._activeLevel === level) {
      return;
    }
    this._activeLevel = level;
    this._hasFocus = false;
  }

  get hasFocus(): boolean {
    return this._hasFocus;
  }

  set hasFocus(hasFocus: boolean) {
    this._hasFocus = hasFocus;
    this._group.selectionCount = 0;
  }

  get level(): number {
    return this._level;
  }

  set level(level: number) {
    if (level < 0) {
      level = 0;
    }
    this._level = level;
  }

  get polygonsGroup(): SquaresGroup {
    return this._group;
  }

  get svgElement(): D3Selection {
    return this._svgElement;
  }

  set svgElement(svgElement: D3Selection) {
    if (!svgElement) {
      throw ReferenceError('The specified element is undefined.');
    }
    this._svgElement = svgElement;
    this._svgElement.append('g')
      .attr('class', 'squares');
    this._svgElement.append('polygon')
      .attr('class', `boundary boundary${this.level}`);
  }

  accept(visitor: BudgetElementVisitor) {
    visitor.visitSimpleBudgetElement(this);
  }

  reset() {
    const isMutable = this.isMutable;
    this.isMutable = true;
    this.amount = this.initialAmount;
    this.isMutable = isMutable;
  }
}
