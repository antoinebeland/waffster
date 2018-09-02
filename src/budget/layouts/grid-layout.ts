import { sum } from 'd3-array';
import * as d3 from 'd3-selection';
import 'd3-transition';

import { Config } from '../../config';
import { Budget } from '../budget';

import { Layout } from './layout';
import { isLayoutConfig, LayoutConfig } from './layout-config';

export class GridLayout extends Layout {
  private readonly _config: LayoutConfig;

  constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, config: LayoutConfig) {
    super(budget, svgElement);
    if (!isLayoutConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._config = config;
  }

  protected initializeLayout() {
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
        .attr('y', 5)
        .selectAll('tspan')
        .data(lines);

      labelLines.exit()
        .remove();

      const labelLinesCreated = labelLines.enter()
        .append('tspan');

      labelLines.merge(labelLinesCreated)
        .attr('x', this._config.polygonLength / 2)
        .attr('dy', 11)
        .text(d => d);

      (g.datum() as any).textHeight = this._config.amountTextHeight + this._config.titleLineHeight * lines.length;
    };

    this._layoutElement.select('#incomes-group')
      .attr('transform', 'translate(0, 0)');

    this._layoutElement.select('#spendings-group')
      .attr('transform', `translate(${this._width / 2}, 0)`);

    this._incomeGroups.each(initializeLabel);
    this._spendingGroups.each(initializeLabel);
  }

  protected renderLayout() {
    const self = this;
    const halfWidth = this._width / 2;

    const count = Math.floor((halfWidth - 2 * this._config.horizontalPadding) /
      (this._config.polygonLength + this._config.horizontalMinSpacing));

    const spacing = (halfWidth - 2 * this._config.horizontalPadding -
      count * this._config.polygonLength) / (count - 1);

    let maxTextHeights = [];
    function findMaxTextHeights(d, i) {
      if (i === 0) {
        maxTextHeights = [];
      }
      if (i % count === 0) {
        maxTextHeights.push(0);
      }
      const index = Math.floor(i / count);
      const height = d.textHeight;
      if (maxTextHeights[index] < height) {
        maxTextHeights[index] = height;
      }
    }

    let x, y, maxHeight, maxHeights = [];
    function applyTransform(d, i) {
      if (i === 0) {
        maxHeights = [];
        y = self._config.verticalPadding;
        maxHeight = 0;
      }
      if (i % count === 0) {
        maxHeights.push(0);
        x = self._config.horizontalPadding;
        if (i !== 0) {
          y += maxHeight + self._config.verticalMinSpacing;
        }
        maxHeight = 0;
      } else {
        x += self._config.polygonLength + spacing;
      }
      const maxTextHeight = maxTextHeights[Math.floor(i / count)];
      d3.select(this)
        .select('.polygons-group')
        .attr('transform', `translate(0, ${maxTextHeight})`);

      if (d.polygonsGroup.boundingBox.height > maxHeight) {
        maxHeight = d.polygonsGroup.boundingBox.height + maxTextHeight;
        maxHeights[Math.floor(i / count)] = maxHeight;
      }
      return `translate(${x}, ${y})`;
    }

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
        const computedHeight = sum(maxHeights) + 2 * self._config.verticalPadding +
          (maxHeights.length - 1) * self._config.verticalMinSpacing + 100;

        const ratio = computedHeight / this._height;
        const computedWidth = this._width /** ratio*/;

        /*this._height = d3.sum(maxHeights) + 2 * self._config.verticalPadding +
          (maxHeights.length - 1) * self._config.verticalMinSpacing + 100;*/
        //this._width = this._height * this._ratio;

        return `0 0 ${computedWidth} ${computedHeight}`;
      });
  }
}
