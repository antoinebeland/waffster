import * as d3 from 'd3-selection';
import 'd3-transition';

import { Config } from '../../config';
import { Budget } from '../budget';

import { Layout } from './layout';
import { isLayoutConfig, LayoutConfig } from './layout-config';

export class BarsLayout extends Layout {
  private readonly _config: LayoutConfig;

  constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>, config: LayoutConfig) {
    super(budget, svgElement);
    if (!isLayoutConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._config = config;
  }

  protected initializeLayout() {
    const self = this;
    let maxLabelHeight = 0;

    function initializeLabel(d) {
      const g = d3.select(this);

      let label = d.name;
      const index = label.indexOf(',');
      if (index !== -1) {
        label = label.substring(0, index);
      }

      const labelWords = label.split(' ');
      let line = '';
      const lines = [];
      labelWords.forEach(w => {
        if (line.length * self._config.averageCharSize < self._config.polygonLength) {
          line += (line.length === 0) ? w : ` ${w}`;
        } else {
          lines.push(line);
          line = w;
        }
      });
      lines.push(line);

      const textGroup = g.select('.text-group')
        .attr('transform', '');

      textGroup.select('.amount')
        .attr('text-anchor', 'middle')
        .attr('x', self._config.polygonLength / 2)
        .attr('y', 0);

      const labelLines = textGroup.select('.label')
        .attr('text-anchor', 'middle')
        .attr('y', 5)
        .selectAll('tspan')
        .data(lines);

      labelLines.exit()
        .remove();

      const labelLinesCreated = labelLines.enter()
        .append('tspan');

      labelLines.merge(labelLinesCreated)
        .attr('x', self._config.polygonLength / 2)
        .attr('dy', 11)
        .text(d => d);

      const height = (textGroup.node() as SVGGraphicsElement).getBBox().height;
      if (maxLabelHeight < height) {
        maxLabelHeight = height;
      }
    }

    function adjustPolygonsGroup() {
      d3.select(this).select('.polygons-group')
        .attr('transform', `translate(0, ${maxLabelHeight})`);
    }

    this._incomeGroups.each(initializeLabel)
      .each(adjustPolygonsGroup);
    this._spendingGroups.each(initializeLabel)
      .each(adjustPolygonsGroup);

    // Compute min size of SVG viewBox.
    const maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
    const approxWidth = this._config.horizontalPadding * 2 + maxCount * this._config.polygonLength +
      (maxCount - 1) * this._config.horizontalMinSpacing;

    const maxElement = this._budget.elements[0];
    const maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count / maxElement.polygonsGroup.config.maxCountPerLine)
      * maxElement.polygonsGroup.config.sideLength;
    const approxHeight = (this._config.verticalPadding * 2 + maxPolygonHeight + maxLabelHeight) * 2;

    this._width = Math.max(approxWidth, this._width);
    this._height = Math.max(approxHeight, this._height);
    this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);

    const halfHeight = this._height / 2;
    this._layout.select('.separator')
      .attr('x1', 0)
      .attr('y1', halfHeight)
      .attr('x2', this._width)
      .attr('y2', halfHeight);

    this._gaugeGroup
      .attr('transform', `translate(${this._width / 2 - Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);

    this._layout.select('#incomes-group')
      .attr('transform', 'translate(0, 0)');

    this._layout.select('#spendings-group')
      .attr('transform', `translate(0, ${halfHeight})`);
  }

  protected renderLayout() {
    const self = this;
    let x;

    function applyTransform(d, i) {
      if (i === 0) {
        x = self._config.horizontalPadding;
      } else {
        x += self._config.polygonLength + self._config.horizontalMinSpacing;
      }
      return `translate(${x}, ${self._config.verticalPadding})`;
    }

    this._incomeGroups.transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);

    this._spendingGroups.transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);
  }
}
