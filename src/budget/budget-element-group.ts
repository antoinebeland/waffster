import { descending } from 'd3-array';

import { Config } from '../config';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { PolygonsSuperGroup } from '../geometry/polygons-super-group';

import { BudgetElement, BudgetElementType } from './budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';

export class BudgetElementGroup extends BudgetElement {
  private readonly _children: BudgetElement[];
  private readonly _group: PolygonsSuperGroup;

  private _hasFocus: boolean;
  private _svgElement: any;

  constructor(name = '', description: '', type: BudgetElementType = BudgetElementType.SPENDING,
              polygonsGroupConfig: PolygonsGroupConfig = Config.DEFAULT_POLYGONS_GROUP_CONFIG) {
    super(name, description, type);
    this._children = [];
    this._group = new PolygonsSuperGroup(polygonsGroupConfig, Config.BUDGET_SUB_ELEMENTS_SPACING);
    this._hasFocus = false;
  }

  get activeLevel(): number {
    return Math.min(this._level + 1, this._activeLevel);
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
    this._group.selectionCount = 0;
    this._children.forEach(c => c.activeLevel = level);
    if (this.level + 1 <= this.activeLevel) {
      if (this.level > 0 && this.activeLevel > 1) {
        (this.root.polygonsGroup as PolygonsSuperGroup).spacing = 3 * Config.BUDGET_SUB_ELEMENTS_SPACING;
      } else {
        this.polygonsGroup.spacing = Config.BUDGET_SUB_ELEMENTS_SPACING;
      }
      this._group.expand();
    } else {
      this._group.collapse();
    }
  }

  get hasFocus(): boolean {
    return this._hasFocus;
  }

  set hasFocus(hasFocus: boolean) {
    this._hasFocus = hasFocus;
    this.selectedAmount = 0;
    this.children.forEach(c => c.hasFocus = hasFocus);
  }

  get level(): number {
    return this._level;
  }

  set level(level: number) {
    if (level < 0) {
      throw new RangeError('Invalid level specified.');
    }
    this._level = level;
    this._children.forEach(c => c.level = level + 1);
  }

  get svgElement(): any {
    return this._svgElement;
  }

  set svgElement(svgElement: any) {
    if (!svgElement) {
      throw ReferenceError('The specified element is undefined.');
    }
    this._svgElement = svgElement;
    const levelGroup = svgElement.append('g')
      .attr('class', 'level-group');

    levelGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', 0);

    levelGroup.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0);

    this.children.forEach(c => {
      c.svgElement = svgElement.append('g');
    });
    this._svgElement.append('polygon')
      .attr('class', `boundary boundary${this.level}`);
  }

  get polygonsGroup(): PolygonsSuperGroup {
    return this._group;
  }

  get children() {
    // TODO: If all the elements are equals, sort by id or name?
    return this._children.sort((a, b) => descending(a.amount, b.amount));
  }

  accept(visitor: BudgetElementVisitor) {
    visitor.visitBudgetElementGroup(this);
  }

  addChild(element: BudgetElement) {
    element.activeLevel = this._activeLevel;
    element.level = this._level + 1;
    element.parent = this;

    this._children.push(element);
    this._group.addGroup(element.polygonsGroup);
  }

  removeChild(element: BudgetElement) {
    this._children.splice(this._children.findIndex(c => c === element), 1);

    element.activeLevel = 0;
    element.level = 0;
    element.parent = undefined;
  }
}
