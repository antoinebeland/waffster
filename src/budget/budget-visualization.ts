import * as d3 from 'd3-selection';
import d3Tip from 'd3-tip';

import { Config } from '../config';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { Formatter } from '../utils/formatter';

import { Budget } from './budget';
import { BudgetElement } from './budget-element';
import { BudgetElementGroup } from './budget-element-group';
import { AddCommand } from './commands/add-command';
import { CommandInvoker } from './commands/command-invoker';
import { DeleteCommand } from './commands/delete-command';
import { Layout } from './layouts/layout';
import { SimpleBudgetElement } from './simple-budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
import { RenderingVisitor } from './visitors/rendering-visitor';

export class BudgetVisualization {
  private readonly _budget: Budget;
  private readonly _commandInvoker: CommandInvoker;
  private readonly _svgElement: d3.Selection<any, any, any, any>;
  private readonly _rendering: RenderingVisitor;

  private _layout: Layout;
  private _isEnabled = true;
  private _isInitialized = false;

  constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>,
              layout: Layout, commandInvoker: CommandInvoker = new CommandInvoker(),
              rendering: RenderingVisitor = new RenderingVisitor(Config.TRANSITION_DURATION)) {
    this._budget = budget;
    this._svgElement = svgElement;
    this._layout = layout;
    this._commandInvoker = commandInvoker;
    this._rendering = rendering;
  }

  set activeLevel(activeLevel: number) {
    this._budget.elements.forEach(e => {
      e.activeLevel = activeLevel;
      e.accept(this._rendering);
    });
    this._layout.render();
  }

  get budget(): Budget {
    return this._budget;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
    if (!isEnabled) {
      this.activeLevel = 0;
    }
  }

  initialize() {
    if (this._isInitialized) {
      throw new Error('The visualization is already initialized.');
    }
    const self = this;
    let hoveredElement: BudgetElement = undefined;
    let selectedElement: BudgetElement = undefined;

    this._svgElement.attr('class', 'budget-visualization');
    this._layout.initialize();

    // Tooltip initialization
    const tip = d3Tip()
      .html(d => {
        let str = `<strong>${d.name} (${Formatter.formatAmount(d.amount + d.temporaryAmount)})</strong>`;
        str += d.description ? `<p>${d.description}</p>` : '';
        return str;
      });

    this._svgElement.call(tip);

    const executeCommand = () => {
      if (selectedElement !== undefined && selectedElement.temporaryAmount !== 0) {
        if (selectedElement.temporaryAmount > 0) {
          this._commandInvoker.invoke(new AddCommand(selectedElement, this._rendering, this._layout));
        } else {
          this._commandInvoker.invoke(new DeleteCommand(selectedElement, this._rendering, this._layout));
        }
      }
    };

    // Creation / Deletion
    d3.select('body')
      .on('wheel', () => {
        if (this._isEnabled && selectedElement) {
          const delta = d3.event.deltaY;
          selectedElement.temporaryAmount += delta / 100 * this._budget.minAmount;
          this._rendering.transitionDuration = 0;
          selectedElement.root.accept(this._rendering);
          this._rendering.resetTransitionDuration();
          this._layout.render();
        }
      })
      .on('keydown', () => {
        if (this._isEnabled && selectedElement) {
          let isValidKey = false;
          switch (d3.event.key) {
            case 'ArrowUp':
              isValidKey = true;
              selectedElement.temporaryAmount -= this._budget.minAmount;
              break;
            case 'ArrowDown':
              isValidKey = true;
              selectedElement.temporaryAmount += this._budget.minAmount;
              break;
          }
          if (!isValidKey) {
            return;
          }
          this._rendering.transitionDuration = 0;
          selectedElement.root.accept(this._rendering);
          this._rendering.resetTransitionDuration();
          this._layout.render();
        }
      })
      .on('click', () => {
        if (this._isEnabled && selectedElement && selectedElement.hasFocus) {
          selectedElement.hasFocus = false;
          selectedElement.accept(this._rendering);
        }
        executeCommand();
        selectedElement = undefined;
      });

    // Events
    const events = new (class implements BudgetElementVisitor {
      visitBudgetElementGroup(group: BudgetElementGroup) {
        this.subscribe(group);

        group.svgElement.select('.level-group')
          .on('mouseenter', () => {
            hoveredElement = group;
            tip.direction('w')
              .offset([0, -8]) // TODO: Put in constant!
              .attr('class', 'd3-tip level-tip')
              .show.call(group.svgElement.node(), group);
          })
          .on('mouseleave', () => {
            hoveredElement = undefined;
            tip.hide();
          })
          .on('click', () => {
            d3.event.stopPropagation();
            executeCommand();
            tip.hide();
            group.activeLevel = group.level;
            group.root.accept(self._rendering);
            self._layout.render();
          });
        group.children.forEach(c => c.accept(this));
      }

      visitSimpleBudgetElement(element: SimpleBudgetElement) {
        this.subscribe(element);
      }

      subscribe(element: BudgetElement) {
        if (!element.svgElement) {
          throw new TypeError('The SVG element is undefined.');
        }

        function showTooltip() {
          if (element.level > 0) {
            tip.direction('e')
              .offset([0, 8])
              .attr('class', 'd3-tip element-tip')
              .show.call(element.svgElement.node(), element);
          }
        }

        element.svgElement.on('click', () => {
          if (self._isEnabled && element.isActive) {
            d3.event.stopPropagation();
            if (selectedElement && selectedElement !== element && selectedElement.hasFocus) {
              selectedElement.hasFocus = false;
              selectedElement.accept(self._rendering);
              executeCommand();
            }
            selectedElement = element;
            element.hasFocus = true;
            element.accept(self._rendering);
          }
        });
        element.svgElement.on('mouseenter', () => {
          if (self._isEnabled && element.isActive) {
            hoveredElement = element;
            hoveredElement.svgElement.classed('hovered', true);
            showTooltip();
          }
        });
        element.svgElement.on('mouseover', () => {
          if (self._isEnabled && element.isActive) {
            hoveredElement = element;
            hoveredElement.svgElement.classed('hovered', true);
            showTooltip();
          }
        });
        element.svgElement.on('mouseleave', () => {
          if (self._isEnabled && element.isActive && hoveredElement) {
            hoveredElement.svgElement.classed('hovered', false);
            hoveredElement = undefined;
            tip.hide();
          }
        });
        element.svgElement.on('dblclick', () => {
          if (self._isEnabled && element.isActive) {
            executeCommand();
            selectedElement = undefined;
            element.activeLevel += 1;
            element.root.accept(self._rendering);
            self._layout.render();

            hoveredElement.svgElement.classed('hovered', false);
            hoveredElement = undefined;
            tip.hide();
          }
        });
      }
    });

    // Events subscription
    this._budget.elements.forEach(e => {
      e.accept(events);
      e.accept(this._rendering);
    });

    // Layout initialisation
    this._layout.render();
    this._isInitialized = true;
  }

  reset() {
    // ...
  }

  update(layout: Layout, polygonsGroupConfig?: PolygonsGroupConfig) {
    if (!this._isInitialized) {
      throw new Error('The visualization is not initialized. Please initialize the visualization first.');
    }
    if (polygonsGroupConfig) {
      const polygonsConfigs = new (class implements BudgetElementVisitor {
        visitBudgetElementGroup(group: BudgetElementGroup) {
          group.polygonsGroup.config = polygonsGroupConfig;
          group.children.forEach(c => c.accept(this));
        }

        visitSimpleBudgetElement(element: SimpleBudgetElement) {
          element.polygonsGroup.config = polygonsGroupConfig;
        }
      });
      this._budget.elements.forEach(e => {
        e.accept(polygonsConfigs);
        e.accept(this._rendering);
      });
    }
    this._layout = layout;
    this._layout.initialize();
    this._layout.render();
  }
}
