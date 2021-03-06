import { ascending, descending } from 'd3-array';
import * as d3 from 'd3-selection';
import d3SimpleGauge from 'd3-simple-gauge';

import { Formatter } from '../../utils/formatter';
import { D3Selection } from '../../utils/types';
import { Budget } from '../budget';
import { BudgetElement } from '../budget-element';

import { isLayoutConfig, LayoutConfig } from './layout-config';

export abstract class Layout {
  protected readonly _budget: Budget;
  protected readonly _svgElement: D3Selection;
  protected readonly _config: LayoutConfig;

  protected _layoutElement: D3Selection;
  protected _budgetGroup: D3Selection;
  protected _incomeGroups: D3Selection;
  protected _spendingGroups: D3Selection;
  protected _gaugeGroup: D3Selection;

  protected _height: number;
  protected _width: number;

  private readonly _defaultTransitionDuration: number;

  protected constructor(budget: Budget, svgElement: D3Selection, config: LayoutConfig) {
    if (!isLayoutConfig(config)) {
      throw new TypeError('Invalid configuration specified.');
    }
    this._budget = budget;
    this._svgElement = svgElement;
    this._config = config;
    this._config.isGaugeDisplayed = config.isGaugeDisplayed !== undefined ? config.isGaugeDisplayed : true;
    this._config.isAmountsDisplayed = config.isAmountsDisplayed !== false;
    this._config.locale = config.locale !== undefined ? config.locale : 'fr';
    this._defaultTransitionDuration = config.transitionDuration;

    if (this._config.size) {
      this._width = this._config.size.width;
      this._height = this._config.size.height;
    } else {
      // Gets the SVG bounding box.
      const bbox = this._svgElement.node().getBoundingClientRect();
      this._width = bbox.width;
      this._height = bbox.height;
    }
  }

  get locale(): string {
    return this._config.locale;
  }

  get transitionDuration(): number {
    return this._config.transitionDuration;
  }

  set transitionDuration(duration: number) {
    if (duration < 0) {
      throw new RangeError('The transition duration must be greater or equal to 0.');
    }
    this._config.transitionDuration = duration;
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
    if (this._config.isGaugeDisplayed) {
      this._gaugeGroup = this._layoutElement.select('#budget-gauge-group');
      if (this._gaugeGroup.size() <= 0) {
        this._gaugeGroup = this._layoutElement.append('g')
          .attr('id', 'budget-gauge-group')
          .attr('class', 'budget-gauge-group');

        this._gaugeGroup.append('rect')
          .attr('width', this._config.gaugeConfig.width)
          .attr('height', this._config.gaugeConfig.height * 1.5 + 10)
          .attr('fill', '#fff');

        this._gaugeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', this._config.gaugeConfig.width / 2)
          .attr('y', this._config.gaugeConfig.height * 1.5);

        // Associate the gauge with the group.
        this._gaugeGroup.datum(new d3SimpleGauge.SimpleGauge({
          barWidth: this._config.gaugeConfig.barWidth,
          el: this._gaugeGroup.append('g'),
          height: this._config.gaugeConfig.height,
          interval: this._config.gaugeConfig.interval,
          needleRadius: this._config.gaugeConfig.needleRadius,
          sectionsCount: 2,
          width: this._config.gaugeConfig.width
        }));
      }
    }

    // Initializes the legend
    if (this._config.legend) {
      let legend = this._layoutElement.select('#budget-legend');
      if (legend.size() <= 0) {
        legend = this._layoutElement.append('g')
          .attr('id', 'budget-legend')
          .attr('class', 'budget-legend')
          .attr('transform', `translate(${this._config.horizontalPadding},
            ${this._height - this._config.verticalPadding / 2})`);

        legend.append('rect')
          .attr('class', 'square')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', this._config.legend.sideLength)
          .attr('height', this._config.legend.sideLength);

        legend.append('text')
          .attr('x', 1.5 * this._config.legend.sideLength)
          .attr('y', this._config.legend.sideLength)
          .style('font-size', `${1.8 * this._config.legend.sideLength}px`)
          .text(`= ${Formatter.formatAmount(this._config.legend.minAmount, this._config.locale)}`);
      }
    }

    if (this._layoutElement.select('#budget-group')) {
      this._budgetGroup = this._layoutElement.append('svg')
        .attr('id', 'budget-group')
        .datum({});

      if (this._config.isGaugeDisplayed) {
        this._budgetGroup.attr('height', this._height - this._config.gaugeConfig.height);
      } else {
        this._budgetGroup.attr('height', this._height);
      }
    }

    const self = this;
    function initializeBudgetElement(d) {
      const g = d3.select(this);
      const textGroup = g.append('g')
        .attr('class', 'text-group');

      if (self._config.isAmountsDisplayed) {
        textGroup.append('text')
          .attr('class', 'element-amount')
          .text(Formatter.formatAmount(d.amount));
      }
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
    const locale = this._config.locale;
    function updateAmount(d) {
      d3.select(this)
        .select('.element-amount')
        .text(Formatter.formatAmount(d.amount + d.temporaryAmount, locale));
    }
    this._incomeGroups = this._incomeGroups
      .sort(Layout.sortElements)
      .each(updateAmount);

    this._spendingGroups = this._spendingGroups
      .sort(Layout.sortElements)
      .each(updateAmount);

    if (this._config.isGaugeDisplayed) {
      const delta = this._budget.summary.delta;
      this._gaugeGroup.datum().value = delta;
      this._layoutElement.select('#budget-gauge-group')
        .select('text')
        .text(Formatter.formatAmount(delta, locale));

    }
    this.renderLayout();
  }

  resetTransitionDuration() {
    this._config.transitionDuration = this._defaultTransitionDuration;
  }

  protected abstract initializeLayout();
  protected abstract renderLayout();

  private static sortElements(a: BudgetElement, b: BudgetElement) {
    let compare = descending(a.amount, b.amount);
    if (compare === 0) {
      compare = ascending(a.name, b.name);
    }
    return compare;
  }
}
