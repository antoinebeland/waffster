import { sum } from 'd3-array';
import * as d3 from 'd3-selection';
import 'd3-transition';

import { Config } from '../../config';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';

import { Layout } from './layout';
import { isLayoutConfig, LayoutConfig } from './layout-config';

const MIN_COUNT_PER_LINE = 5;

export class GridLayout extends Layout {
  private readonly _config: LayoutConfig;
  private readonly _countPerLine: number;
  private readonly _spacing: number;
  private readonly _budgetWidth: number;

  constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig, minCountPerLine = MIN_COUNT_PER_LINE) {
    super(budget, svgElement);
    if (!isLayoutConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._config = config;
    this._spacing = 0;

    const halfWidth = this._width / 2;
    let count = Math.floor((halfWidth - 2 * this._config.horizontalPadding) /
      (this._config.polygonLength + this._config.horizontalMinSpacing));

    if (count < minCountPerLine && (budget.spendings.length > count || budget.incomes.length > count)) {
      this._countPerLine = minCountPerLine;
      this._spacing = this._config.horizontalMinSpacing;
    } else {
      this._countPerLine = count;
      if (count > 1) {
        this._spacing = (halfWidth - 2 * this._config.horizontalPadding -
          count * this._config.polygonLength) / (count - 1);
      }
    }
    this._budgetWidth = 2 * (2 * this._config.horizontalPadding + this._countPerLine *
      this._config.polygonLength + (this._countPerLine - 1) * this._spacing);

    console.log(this._budgetWidth);
    console.log(this._width);
  }

  protected initializeLayout() {
    this._budgetGroup.attr('viewBox', `0 0 ${this._budgetWidth} ${this._height}`);
    this._gaugeGroup
      .attr('transform',
        `translate(${this._width / 2 - Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);

    const initializeLabel = (d, i, nodes) => {
      const g = d3.select(nodes[i]);

      // Spits the element's name based on the polygon width.
      let name = d.name;
      const index = name.indexOf(',');
      if (index !== -1) {
        name = name.substring(0, index);
      }

      const nameWords = name.split(' ');
      let line = '';
      const lines = [];
      nameWords.forEach(w => {
        if (line.length * this._config.averageCharSize < this._config.polygonLength) {
          line += (line.length === 0) ? w : ` ${w}`;
        } else {
          lines.push(line);
          line = w;
        }
      });
      lines.push(line);

      const textGroup = g.select('.text-group')
        .attr('transform', '');

      textGroup.select('.element-amount')
        .attr('text-anchor', 'middle')
        .attr('x', this._config.polygonLength / 2)
        .attr('y', 0);

      const labelLines = textGroup.select('.element-name')
        .attr('text-anchor', 'middle')
        .attr('y', this._config.amountTextHeight * 0.3)
        .selectAll('tspan')
        .data(lines);

      labelLines.exit()
        .remove();

      const labelLinesCreated = labelLines.enter()
        .append('tspan');

      labelLines.merge(labelLinesCreated)
        .attr('x', this._config.polygonLength / 2)
        .attr('dy', this._config.titleLineHeight)
        .text(d => d);

      (g.datum() as any).textHeight = this._config.amountTextHeight + this._config.titleLineHeight * lines.length;
    };

    this._layoutElement.select('#incomes-group')
      .attr('transform', 'translate(0, 0)');

    this._layoutElement.select('#spendings-group')
      .attr('transform', `translate(${this._budgetWidth / 2}, 0)`);

    this._incomeGroups.each(initializeLabel);
    this._spendingGroups.each(initializeLabel);
  }

  protected renderLayout() {
    let maxTextHeights = [];
    const findMaxTextHeights = (d, i) => {
      if (i === 0) {
        maxTextHeights = [];
      }
      if (i % this._countPerLine === 0) {
        maxTextHeights.push(0);
      }
      const index = Math.floor(i / this._countPerLine);
      const height = d.textHeight;
      if (maxTextHeights[index] < height) {
        maxTextHeights[index] = height;
      }
    };

    let x, y, maxHeight, maxHeights = [];
    const applyTransform = (d, i, nodes) => {
      if (i === 0) {
        maxHeights = [];
        y = this._config.verticalPadding;
        maxHeight = 0;
      }
      if (i % this._countPerLine === 0) {
        maxHeights.push(0);
        x = this._config.horizontalPadding;
        if (i !== 0) {
          y += maxHeight + this._config.verticalMinSpacing;
        }
        maxHeight = 0;
      } else {
        x += this._config.polygonLength + this._spacing;
      }
      const maxTextHeight = maxTextHeights[Math.floor(i / this._countPerLine)];
      d3.select(nodes[i])
        .select('.polygons-group')
        .attr('transform', `translate(0, ${maxTextHeight})`);

      if (d.polygonsGroup.boundingBox.height > maxHeight) {
        maxHeight = d.polygonsGroup.boundingBox.height + maxTextHeight;
        maxHeights[Math.floor(i / this._countPerLine)] = maxHeight;
      }
      return `translate(${x}, ${y})`;
    };

    this._incomeGroups.each(findMaxTextHeights)
      .transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);

    this._spendingGroups.each(findMaxTextHeights)
      .transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);

    this._budgetGroup
      .transition()
      .duration(this._config.transitionDuration)
      .attr('viewBox', () => {
        const computedHeight = sum(maxHeights) + 2 * this._config.verticalPadding +
          (maxHeights.length - 1) * this._config.verticalMinSpacing + 100;
        return `0 0 ${this._budgetWidth} ${computedHeight}`;
      });
  }
}
