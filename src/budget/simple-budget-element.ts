import { Selection } from 'd3-selection';

import { Config } from '../config';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { SquaresGroup } from '../geometry/squares-group';

import { BudgetElement, BudgetElementType } from './budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';

export class SimpleBudgetElement extends BudgetElement {
  readonly initialAmount: number;

  private readonly _group: SquaresGroup;
  private _hasFocus: boolean;
  private _svgElement: Selection<any, any, any, any>;

  constructor(amount = 0, name = '', description = '', type: BudgetElementType = BudgetElementType.SPENDING,
              minAmount: number = Config.MIN_AMOUNT,
              polygonsGroupConfig: PolygonsGroupConfig = Config.DEFAULT_POLYGONS_GROUP_CONFIG) {
    super(name, description, type, minAmount);
    this.initialAmount = amount;
    this._group = new SquaresGroup(Math.round(amount / this._minAmount), polygonsGroupConfig);
    this._hasFocus = false;
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

  get svgElement(): Selection<any, any, any, any> {
    return this._svgElement;
  }

  set svgElement(svgElement: Selection<any, any, any, any>) {
    if (!svgElement) {
      throw ReferenceError('The specified element is undefined.');
    }
    this._svgElement = svgElement;
    this._svgElement.append('g')
      .attr('class', 'squares');
    this._svgElement.append('polygon')
      .attr('class', `boundary boundary${this.level}`);
  }

  get polygonsGroup(): SquaresGroup {
    return this._group;
  }

  accept(visitor: BudgetElementVisitor) {
    visitor.visitSimpleBudgetElement(this);
  }

  reset() {
    this.amount = this.initialAmount;
  }
}
