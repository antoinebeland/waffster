import { max } from 'd3-array';
import * as d3 from 'd3-selection';
import 'd3-transition';

import { Config } from '../../config';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';

import { Layout } from './layout';
import { isLayoutConfig, LayoutConfig } from './layout-config';

export class HorizontalBarsLayout extends Layout {
  private readonly _config: LayoutConfig;

  constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig) {
    super(budget, svgElement);
    if (!isLayoutConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._config = config;
  }

  protected initializeLayout() {
    const self = this;
    const maxLengthName = max(this._budget.elements, d => d.name.length);
    let maxLabelWidth = 0;

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
        if (line.length * self._config.averageCharSize < maxLengthName * self._config.averageCharSize / 4) {
          line += (line.length === 0) ? w : ` ${w}`;
        } else {
          lines.push(line);
          line = w;
        }
      });
      lines.push(line);

      const textGroup = g.select('.text-group');
      textGroup.select('.amount')
        .attr('text-anchor', 'end')
        .attr('x', 0)
        .attr('y', 7);

      const labelLines = textGroup.select('.label')
        .attr('text-anchor', 'end')
        .attr('y', 10)
        .selectAll('tspan')
        .data(lines);

      labelLines.exit()
        .remove();

      const labelLinesCreated = labelLines.enter()
        .append('tspan');

      labelLines.merge(labelLinesCreated)
        .attr('x', 0)
        .attr('dy', 11)
        .text(d => d);

      g.select('.polygons-group')
        .attr('transform', '');

      const labelWidth = (textGroup.node() as SVGGraphicsElement).getBBox().width;
      if (maxLabelWidth < labelWidth) {
        maxLabelWidth = labelWidth;
      }
    }

    function adjustGroup() {
      const g = d3.select(this);
      g.select('.text-group')
        .attr('transform', `translate(${maxLabelWidth}, 0)`);

      g.select('.polygons-group')
        .attr('transform', `translate(${maxLabelWidth + self._config.horizontalPadding}, 0)`);
    }

    this._incomeGroups.each(initializeLabel)
      .each(adjustGroup);
    this._spendingGroups.each(initializeLabel)
      .each(adjustGroup);

    // Compute min size of SVG viewBox.
    const maxCount = Math.max(this._budget.incomes.length, this._budget.spendings.length);
    const approxHeight = this._config.verticalPadding * 2 + maxCount * this._config.polygonLength +
      (maxCount - 1) * this._config.verticalMinSpacing;

    const maxElement = this._budget.elements[0];
    const maxPolygonHeight = Math.ceil(maxElement.polygonsGroup.count /
      maxElement.polygonsGroup.config.maxCountPerLine) * maxElement.polygonsGroup.config.sideLength;
    const approxWidth = (this._config.horizontalPadding * 2 + maxPolygonHeight + maxLabelWidth +
      self._config.horizontalPadding) * 2;

    this._width = Math.max(approxWidth, this._width);
    this._height = Math.max(approxHeight, this._height);
    this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);

    const halfWidth = this._width / 2;
    this._layoutElement.select('.separator')
      .attr('x1', halfWidth)
      .attr('y1', 0)
      .attr('x2', halfWidth)
      .attr('y2', this._height);

    this._gaugeGroup
      .attr('transform', `translate(${this._width / 2 - Config.GAUGE_CONFIG.width / 2}, ${this._height - 110})`);

    this._layoutElement.select('#incomes-group')
      .attr('transform', `translate(${halfWidth}, 0)`);
    this._layoutElement.select('#spendings-group')
      .attr('transform', 'translate(0, 0)');
  }

  protected renderLayout() {
    const self = this;
    let y;

    function applyTransform(d, i) {
      if (i === 0) {
        y = self._config.verticalPadding;
      } else {
        y += self._config.polygonLength + self._config.verticalMinSpacing;
      }
      return `translate(${self._config.horizontalPadding}, ${y})`;
    }

    this._incomeGroups.transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);

    this._spendingGroups.transition()
      .duration(this._config.transitionDuration)
      .attr('transform', applyTransform);
  }
}
