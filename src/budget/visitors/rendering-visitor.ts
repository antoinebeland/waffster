import 'd3-transition';

import { Config } from '../../config';
import { BudgetElement } from '../budget-element';
import { BudgetElementGroup } from '../budget-element-group';
import { SimpleBudgetElement } from '../simple-budget-element';

import { BudgetElementVisitor } from './budget-element-visitor';

export class RenderingVisitor implements BudgetElementVisitor {
  private readonly _defaultTransitionDuration: number;
  private readonly _levelStack = [];
  private _transitionDuration: number;

  constructor(defaultTransitionDuration: number) {
    this._defaultTransitionDuration = this.transitionDuration = defaultTransitionDuration;
  }

  get transitionDuration(): number {
    return this._transitionDuration;
  }

  set transitionDuration(duration: number) {
    if (duration < 0) {
      throw new RangeError('The transition duration must be greater or equal to 0.');
    }
    this._transitionDuration = duration;
  }

  resetTransitionDuration() {
    this._transitionDuration = this._defaultTransitionDuration;
  }

  visitBudgetElementGroup(group: BudgetElementGroup) {
    if (this._levelStack.length === 0) {
      group.polygonsGroup.update();
    }
    this._levelStack.push(0);
    group.svgElement.selectAll('.empty')
      .remove();

    RenderingVisitor.updateBoundary(group);
    group.children.forEach((c, i) => {
      c.accept(this);
      c.svgElement.transition()
        .duration(this._transitionDuration)
        .attr('class', (c.level - 1 === c.activeLevel && Config.IS_USING_DISTINCT_COLORS) ? `group${i}` : '')
        .attr('transform',
          `translate(${c.polygonsGroup.translation.x}, ${c.polygonsGroup.translation.y})`);
    });

    if (group.activeLevel - group.level === 1) {
      const offset = this._levelStack[this._levelStack.length - 1] >= 1 ? 14 : 7;
      const halfOffset = offset / 2;

      const levelGroup = group.svgElement.select('.level-group');
      levelGroup.select('rect')
        .transition()
        .duration(this._transitionDuration)
        .attr('x', -offset)
        .attr('y', -halfOffset)
        .attr('height', group.polygonsGroup.boundingBox.height + offset)
        .attr('width', offset);

      levelGroup.select('line')
        .transition()
        .duration(this._transitionDuration)
        .attr('x1', -offset)
        .attr('y1', -halfOffset)
        .attr('x2', -offset)
        .attr('y2', group.polygonsGroup.boundingBox.height + halfOffset);

      this._levelStack[this._levelStack.length - 1] = 1;
    } else {
      const levelGroup = group.svgElement.select('.level-group');
      levelGroup.select('rect')
        .transition()
        .duration(this._transitionDuration)
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 0)
        .attr('width', 0);

      levelGroup.select('line')
        .transition()
        .duration(this._transitionDuration)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 0);
    }
    if (group.isActive && group.amount === 0) {
      RenderingVisitor.createEmptyElement(group);
    }

    const count = this._levelStack.pop();
    if (this._levelStack.length >= 1) {
      this._levelStack[this._levelStack.length - 1] += count;
    }
  }

  visitSimpleBudgetElement(element: SimpleBudgetElement) {
    const polygons = element.svgElement.select('.squares').selectAll('.square')
      .data(element.polygonsGroup.polygons, d => (d as any).id);

    RenderingVisitor.updateBoundary(element);
    polygons.enter()
      .append('polygon')
      .on('animationend', function() {
        if (!element.hasFocus) {
          (this as SVGGraphicsElement).classList.remove('selected');
          element.selectedAmount = 0;
        }
      })
      .merge(polygons)
      .attr('class', `square ${element.type}`)
      .classed('focused', element.hasFocus)
      .classed('selected', d => d.isSelected)
      .classed('temporary', d => d.isTemporary)
      .classed('added', d => d.isTemporary && element.temporaryAmount > 0)
      .classed('removed', d => d.isTemporary && element.temporaryAmount < 0)
      .transition()
      .duration(this._transitionDuration)
      .attr('points', d => d.points.map(e => `${e.x} ${e.y}`).join(', '));

    polygons.exit()
      .remove();

    if (element.isActive && element.amount === 0) {
      RenderingVisitor.createEmptyElement(element);
    }
  }

  private static createEmptyElement(element: BudgetElement) {
    const sideLength = element.polygonsGroup.config.sideLength;
    element.svgElement.append('rect')
      .attr('class', 'square empty')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', sideLength)
      .attr('height', sideLength);
  }

  private static updateBoundary(element: BudgetElement) {
    element.svgElement.select(`.boundary${element.level}`)
      .attr('points', (element.level - 1 <= element.activeLevel)
        ? element.polygonsGroup.boundary.map(e => `${e.x} ${e.y}`).join(', ')
        : '');
  }
}
