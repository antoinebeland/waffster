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
  readonly budget: Budget;
  readonly commandInvoker: CommandInvoker;
  readonly svgElement: d3.Selection<any, any, any, any>;
  readonly rendering: RenderingVisitor;
  readonly tip: d3Tip;

  private _layout: Layout;
  private _isEnabled = true;
  private _isInitialized = false;

  constructor(budget: Budget, svgElement: d3.Selection<any, any, any, any>,
              layout: Layout, commandInvoker: CommandInvoker = new CommandInvoker(),
              rendering: RenderingVisitor = new RenderingVisitor(Config.TRANSITION_DURATION)) {
    this.budget = budget;
    this.svgElement = svgElement;
    this._layout = layout;
    this.commandInvoker = commandInvoker;
    this.rendering = rendering;
    this.tip = d3Tip()
      .html(d => {
        let str = `<strong>${d.name} (${Formatter.formatAmount(d.amount + d.temporaryAmount)})</strong>`;
        str += d.description ? `<p>${d.description}</p>` : '';
        return str;
      });
  }

  set activeLevel(activeLevel: number) {
    this.budget.elements.forEach(e => {
      e.activeLevel = activeLevel;
      e.accept(this.rendering);
    });
    this._layout.render();
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(isEnabled: boolean) {
    this._isEnabled = isEnabled;
    this.svgElement.classed('disabled', !isEnabled);
    if (!isEnabled) {
      this.activeLevel = 0;
    }
  }

  get layout(): Layout {
    return this._layout;
  }

  initialize() {
    if (this._isInitialized) {
      throw new Error('The visualization is already initialized.');
    }
    const self = this;
    let hoveredElement: BudgetElement = undefined;
    let selectedElement: BudgetElement = undefined;

    this.svgElement.attr('class', 'budget-visualization');
    this._layout.initialize();
    this.svgElement.call(this.tip);

    const executeCommand = () => {
      if (selectedElement !== undefined && selectedElement.temporaryAmount !== 0) {
        if (selectedElement.temporaryAmount > 0) {
          this.commandInvoker.invoke(new AddCommand(selectedElement, this.rendering, this._layout));
        } else {
          this.commandInvoker.invoke(new DeleteCommand(selectedElement, this.rendering, this._layout));
        }
      }
    };

    // Creation / Deletion
    d3.select('body')
      .on('wheel', () => {
        if (this._isEnabled && selectedElement) {
          let delta = d3.event.deltaY / 100;
          delta = (delta >= 0) ? Math.ceil(delta) : Math.floor(delta);
          selectedElement.temporaryAmount += delta * this.budget.minAmount;
          this.rendering.transitionDuration = 0;
          selectedElement.root.accept(this.rendering);
          this.rendering.resetTransitionDuration();
          this._layout.render();
        }
      })
      .on('keydown', () => {
        if (this._isEnabled && selectedElement) {
          let isValidKey = false;
          switch (d3.event.key) {
            case 'ArrowUp':
              isValidKey = true;
              selectedElement.temporaryAmount -= this.budget.minAmount;
              break;
            case 'ArrowDown':
              isValidKey = true;
              selectedElement.temporaryAmount += this.budget.minAmount;
              break;
          }
          if (!isValidKey) {
            return;
          }
          this.rendering.transitionDuration = 0;
          selectedElement.root.accept(this.rendering);
          this.rendering.resetTransitionDuration();
          this._layout.render();
        }
      })
      .on('click', () => {
        if (this._isEnabled && selectedElement && selectedElement.hasFocus) {
          selectedElement.hasFocus = false;
          selectedElement.accept(this.rendering);
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
            if (!self._isEnabled) {
              return;
            }
            hoveredElement = group;
            self.tip.direction('w')
              .offset([0, -8]) // TODO: Put in constant!
              .attr('class', 'd3-tip level-tip')
              .show.call(group.svgElement.node(), group);
          })
          .on('mouseleave', () => {
            if (!self._isEnabled) {
              return;
            }
            hoveredElement = undefined;
            self.tip.hide();
          })
          .on('click', () => {
            if (!self._isEnabled) {
              return;
            }
            d3.event.stopPropagation();
            executeCommand();
            self.tip.hide();
            group.activeLevel = group.level;
            group.root.accept(self.rendering);
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
            self.tip.direction('e')
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
              selectedElement.accept(self.rendering);
              executeCommand();
            }
            selectedElement = element;
            element.hasFocus = true;
            element.accept(self.rendering);
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
            self.tip.hide();
          }
        });
        element.svgElement.on('dblclick', () => {
          if (self._isEnabled && element.isActive) {
            executeCommand();
            selectedElement = undefined;
            element.activeLevel += 1;
            element.root.accept(self.rendering);
            self._layout.render();

            hoveredElement.svgElement.classed('hovered', false);
            hoveredElement = undefined;
            self.tip.hide();
          }
        });
      }
    });

    // Events subscription
    this.budget.elements.forEach(e => {
      e.accept(events);
      e.accept(this.rendering);
    });

    // Layout initialisation
    this._layout.render();
    this._isInitialized = true;
  }

  reset() {
    this.budget.elements.forEach(e => {
      e.activeLevel = 0;
      e.reset();
      e.accept(this.rendering);
    });
    this._layout.render();
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
      this.budget.elements.forEach(e => {
        e.accept(polygonsConfigs);
        e.accept(this.rendering);
      });
    }
    this._layout = layout;
    this._layout.initialize();
    this._layout.render();
  }
}
