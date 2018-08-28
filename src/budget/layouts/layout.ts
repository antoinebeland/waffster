import { descending } from 'd3-array';
import * as d3 from 'd3-selection';
import SimpleGauge from 'd3-simple-gauge';

import { Config } from '../../config';
import { Formatter } from '../../utils/formatter';
import { Budget } from '../budget';
import { BudgetElement } from '../budget-element';

export abstract class Layout {
  protected readonly _budget: Budget;
  protected readonly _svgElement: any;

  protected _layout: any;
  protected _budgetGroup: any;
  protected _incomeGroups: any;
  protected _spendingGroups: any;
  protected _gaugeGroup: any;

  protected _height: number;
  protected _width: number;

  protected constructor(budget: Budget, svgElement: any) {
    this._budget = budget;
    this._svgElement = svgElement;

    const element = this._svgElement.node();
    this._width = element.clientWidth;
    this._height = element.clientHeight;
  }

  initialize() {
    this._svgElement.attr('viewBox', `0 0 ${this._width} ${this._height}`);
    this._layout = this._svgElement.select('#layout');
    if (!this._layout.size()) {
      this._layout = this._svgElement.append('g')
        .attr('id', 'layout');
    }
    let separator = this._layout.select('.separator');
    if (separator.size() <= 0) {
      this._layout.append('line')
        .attr('class', 'separator');
    }
    this._gaugeGroup = this._layout.select('#budget-gauge-group');
    if (this._gaugeGroup.size() <= 0) {
      this._gaugeGroup = this._layout.append('g')
        .attr('id', 'budget-gauge-group');

      this._gaugeGroup.append('rect')
        .attr('width', Config.GAUGE_CONFIG.width)
        .attr('height', Config.GAUGE_CONFIG.height + 45)
        .attr('fill', '#fff');

      this._gaugeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', Config.GAUGE_CONFIG.width / 2)
        .attr('y', 95);

      // Associate the gauge with the group.
      this._gaugeGroup.datum(new SimpleGauge({
        barWidth: Config.GAUGE_CONFIG.barWidth,
        el: this._gaugeGroup.append('g'),
        height: Config.GAUGE_CONFIG.height,
        interval: Config.GAUGE_CONFIG.interval,
        needleRadius: Config.GAUGE_CONFIG.needleRadius,
        sectionsCount: 2,
        width: Config.GAUGE_CONFIG.width
      }));
    }

    if (this._layout.select('#budget-group')) {
      this._budgetGroup = this._layout.append('svg')
        .attr('id', 'budget-group')
        .attr('height', this._height - Config.GAUGE_CONFIG.height);
    }
    this._budgetGroup.attr('viewBox', `0 0 ${this._width} ${this._height}`);

    function initializeBudgetElement(d) {
      const g = d3.select(this);
      const textGroup = g.append('g')
        .attr('class', 'text-group');

      textGroup.append('text')
        .attr('class', 'amount')
        .text(Formatter.formatAmount(d.amount));

      textGroup.append('text')
        .attr('class', 'label');

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
        .data(budgetElements, d => d.id);

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
        .select('.amount')
        .text(Formatter.formatAmount(d.amount + d.temporaryAmount));
    }
    this._incomeGroups = this._incomeGroups.sort((a, b) => descending(a.amount, b.amount))
      .each(updateAmount);
    this._spendingGroups = this._spendingGroups.sort((a, b) => descending(a.amount, b.amount))
      .each(updateAmount);

    const delta = this._budget.summary.delta;
    this._gaugeGroup.datum().value = delta;
    this._layout.select('#budget-gauge-group')
      .select('text')
      .text(Formatter.formatAmount(delta));

    this.renderLayout();
  }

  protected abstract initializeLayout();
  protected abstract renderLayout();
}
