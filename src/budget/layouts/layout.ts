import { descending } from 'd3-array';
import * as d3 from 'd3-selection';
import d3SimpleGauge from 'd3-simple-gauge';

import { Config } from '../../config';
import { Formatter } from '../../utils/formatter';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
import { BudgetElement } from '../budget-element';

export abstract class Layout {
  protected readonly _budget: Budget;
  protected readonly _svgElement: D3Selection;

  protected _layoutElement: D3Selection;
  protected _budgetGroup: D3Selection;
  protected _incomeGroups: D3Selection;
  protected _spendingGroups: D3Selection;
  protected _gaugeGroup: D3Selection;

  protected _height: number;
  protected _width: number;

  private readonly _isGaugeDisplayed: boolean;

  protected constructor(budget: Budget, svgElement: D3Selection, isGaugeDisplayed = true) {
    this._budget = budget;
    this._svgElement = svgElement;

    // Gets the SVG bounding box.
    const bbox = this._svgElement.node().getBoundingClientRect();
    this._width = bbox.width;
    this._height = bbox.height;
    this._isGaugeDisplayed = isGaugeDisplayed;
  }

  initialize() {
    this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);

    // Retrieves the layout element.
    this._layoutElement = this._svgElement.select('#layout');
    if (!this._layoutElement.size()) {
      this._layoutElement = this._svgElement.append('g')
        .attr('id', 'layout');
    }

    // Initializes the gauge
    if (this._isGaugeDisplayed) {
      this._gaugeGroup = this._layoutElement.select('#budget-gauge-group');
      if (this._gaugeGroup.size() <= 0) {
        this._gaugeGroup = this._layoutElement.append('g')
          .attr('id', 'budget-gauge-group')
          .attr('class', 'budget-gauge-group');

        this._gaugeGroup.append('rect')
          .attr('width', Config.GAUGE_CONFIG.width)
          .attr('height', Config.GAUGE_CONFIG.height + 45)
          .attr('fill', '#fff');

        this._gaugeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', Config.GAUGE_CONFIG.width / 2)
          .attr('y', 95);

        // Associate the gauge with the group.
        this._gaugeGroup.datum(new d3SimpleGauge.SimpleGauge({
          barWidth: Config.GAUGE_CONFIG.barWidth,
          el: this._gaugeGroup.append('g'),
          height: Config.GAUGE_CONFIG.height,
          interval: Config.GAUGE_CONFIG.interval,
          needleRadius: Config.GAUGE_CONFIG.needleRadius,
          sectionsCount: 2,
          width: Config.GAUGE_CONFIG.width
        }));
      }
    }
    if (this._layoutElement.select('#budget-group')) {
      this._budgetGroup = this._layoutElement.append('svg')
        .attr('id', 'budget-group');

      if (this._isGaugeDisplayed) {
        this._budgetGroup.attr('height', this._height - Config.GAUGE_CONFIG.height);
      }
    }

    function initializeBudgetElement(d) {
      const g = d3.select(this);
      const textGroup = g.append('g')
        .attr('class', 'text-group');

      textGroup.append('text')
        .attr('class', 'element-amount')
        .text(Formatter.formatAmount(d.amount));

      textGroup.append('text')
        .attr('class', 'element-name');

      d.svgElement = g.append('g')
        .attr('class', 'polygons-group');
    }
    const createGroups = (budgetElements: BudgetElement[], id: string) => {
      let group = this._budgetGroup.select(`#${id}`);
      if (!group.size()) {
        group = this._budgetGroup.append('g')
          .attr('id', id);
      }
      const groups = group.selectAll('g')
        .data(budgetElements, d => (d as any).id);

      const groupsCreated = groups.enter()
        .append('g')
        .each(initializeBudgetElement);

      return groups.merge(groupsCreated);
    };

    this._incomeGroups = createGroups(this._budget.incomes, 'incomes-group');
    this._spendingGroups = createGroups(this._budget.spendings, 'spendings-group');
    this.initializeLayout();
  }

  render() {
    function updateAmount(d) {
      d3.select(this)
        .select('.element-amount')
        .text(Formatter.formatAmount(d.amount + d.temporaryAmount));
    }
    this._incomeGroups = this._incomeGroups
      .sort((a, b) => descending(a.amount, b.amount))
      .each(updateAmount);

    this._spendingGroups = this._spendingGroups
      .sort((a, b) => descending(a.amount, b.amount))
      .each(updateAmount);

    if (this._isGaugeDisplayed) {
      const delta = this._budget.summary.delta;
      this._gaugeGroup.datum().value = delta;
      this._layoutElement.select('#budget-gauge-group')
        .select('text')
        .text(Formatter.formatAmount(delta));

    }
    this.renderLayout();
  }

  protected abstract initializeLayout();
  protected abstract renderLayout();
}
