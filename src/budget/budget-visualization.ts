import * as d3 from 'd3';
import { DragContainerElement } from 'd3';
import * as d3Tip from 'd3-tip';

import { Config } from '../config';
import { PolygonsGroupConfig } from '../geometry/polygons-group-configs';
import { SquaresGroup } from '../geometry/squares-group';

import { Budget } from './budget';
import { BudgetElement } from './budget-element';
import { BudgetElementGroup } from './budget-element-group';
import { AddCommand } from './commands/add-command';
import { CommandInvoker } from './commands/command-invoker';
import { DeleteCommand } from './commands/delete-command';
import { TransferCommand } from './commands/transfer-command';
import { Layout } from './layouts/layout';
import { SimpleBudgetElement } from './simple-budget-element';
import { BudgetElementVisitor } from './visitors/budget-element-visitor';
import { RenderingVisitor } from './visitors/rendering-visitor';

export class BudgetVisualization {
  private readonly _budget: Budget;
  private readonly _commandInvoker: CommandInvoker;
  private readonly _svgElement: any;
  private readonly _rendering: RenderingVisitor;

  private _layout: Layout;
  private _isInitialized = false;

  constructor(budget: Budget, svgElement: any, layout: Layout,
              commandInvoker: CommandInvoker = new CommandInvoker(),
              rendering: RenderingVisitor = new RenderingVisitor(Config.TRANSITION_DURATION)) {
    this._budget = budget;
    this._svgElement = svgElement;
    this._layout = layout;
    this._commandInvoker = commandInvoker;
    this._rendering = rendering;
  }

  get budget(): Budget {
    return this._budget;
  }

  set activeLevel(activeLevel: number) {
    this._budget.elements.forEach(e => {
      e.activeLevel = activeLevel;
      e.accept(this._rendering);
    });
    this._layout.render();
  }

  initialize() {
    if (this._isInitialized) {
      throw new Error('The visualization is already initialized.');
    }
    const self = this;
    let isDragging = false;
    let hoveredElement: BudgetElement = undefined;
    let selectedElement: BudgetElement = undefined;
    let selectionSquaresGroup;
    let mustExecuteAddCommand = false;

    this._layout.initialize();

    // Tooltip initialization
    const tip = d3Tip()
      .html(d => {
        let str = `<h1>${d.name} (${Formatter.formatAmount(d.amount)})</h1>`;
        str += d.description ? `<p>${d.description}</p>` : '';
        return str;
      });

    this._svgElement.call(tip);

    // TODO: Maybe put in member variables
    const selectionGroup = this._svgElement.append('g')
      .attr('id', 'selection')
      .style('display', 'none')
      .style('opacity', 0.5);

    const executeAddCommand = () => {
      mustExecuteAddCommand = false;
      if (selectedElement !== undefined) {
        this._commandInvoker.invoke(new AddCommand(selectedElement, this._rendering, this._layout));
      }
    };

    // Selection / creation
    d3.select('body')
      .on('wheel', () => {
        if (selectedElement) {
          const delta = d3.event.deltaY;
          if (selectedElement.selectedAmount <= 0 && delta > 0 || selectedElement.temporaryAmount > 0) {
            mustExecuteAddCommand = true;
            selectedElement.temporaryAmount += delta / 100 * Config.MIN_AMOUNT;

            this._rendering.transitionDuration = 0;
            selectedElement.root.accept(this._rendering);
            this._rendering.resetTransitionDuration();
            this._layout.render();
          } else {
            mustExecuteAddCommand = false;
            selectedElement.selectedAmount += -1 * delta / 100 * Config.MIN_AMOUNT;
            selectedElement.accept(this._rendering);
          }
        }
      })
      .on('click', () => {
        if (selectedElement && selectedElement.hasFocus) {
          selectedElement.hasFocus = false;
          selectedElement.accept(this._rendering);
        }
        if (mustExecuteAddCommand) {
          executeAddCommand();
        }
        selectedElement = undefined;
      });

    // Drag and drop
    this._svgElement.call(d3.drag()
      .container(function () {
        return this as DragContainerElement;
      })
      .filter(() => selectedElement !== undefined && selectedElement.selectedAmount > 0)
      .on('start', () => {
        isDragging = true;
        selectedElement.svgElement.classed('drag', true);

        const selectionCount = selectedElement.polygonsGroup.selectionCount;
        const polygonsGroupConfig = selectedElement.polygonsGroup.config;

        if (selectedElement.polygonsGroup.selectionCount >= polygonsGroupConfig.maxCountPerLine) {
          polygonsGroupConfig.startingPosition = (selectedElement.polygonsGroup.count - selectionCount)
            % polygonsGroupConfig.maxCountPerLine;
        } else {
          polygonsGroupConfig.startingPosition = 0;
        }
        selectionSquaresGroup = new SquaresGroup(selectionCount, polygonsGroupConfig);
        const polygons = selectionGroup.selectAll('polygon')
          .data(selectionSquaresGroup.polygons);

        polygons.enter()
          .append('polygon')
          .merge(polygons)
          .attr('class', 'squares')
          .attr('points', d => d.points.map(e => `${e.x} ${e.y}`).join(', '));

        polygons.exit()
          .remove();

        selectionGroup.attr('transform',
          `translate(${d3.event.x -
          selectionSquaresGroup.boundingBox.width / 2}, ${d3.event.y - selectionSquaresGroup.boundingBox.height / 2})`)
          .style('display', 'block');
      })
      .on('drag', () => {
        selectionGroup.attr('transform',
          `translate(${d3.event.x -
          selectionSquaresGroup.boundingBox.width / 2}, ${d3.event.y - selectionSquaresGroup.boundingBox.height / 2})`);
      })
      .on('end', () => {
        isDragging = false;
        selectedElement.svgElement.classed('drag', false);

        selectionGroup.style('display', 'none');
        if (hoveredElement !== undefined && selectedElement !== hoveredElement) {
          tip.hide();
          this._commandInvoker.invoke(
            new TransferCommand(selectedElement, hoveredElement, this._rendering, this._layout));
        } else if (selectedElement !== hoveredElement) {
          //this._commandInvoker.invoke(new DeleteCommand(selectedElement, this._rendering, this._layout));
        }
      })
    );

    // Events
    const events = new (class implements BudgetElementVisitor {
      visitBudgetElementGroup(group: BudgetElementGroup) {
        this.subscribe(group);

        group.svgElement.select('.level-group')
          .on('mouseenter', () => {
            hoveredElement = group;
            tip.direction('w')
              .offset([0, -8])
              .attr('class', 'd3-tip level-tip')
              .show.call(group.svgElement.node(), group);

            d3.timeout(() => {
              if (isDragging && hoveredElement === group && group.activeLevel > 0) {
                group.activeLevel -= 1;
                group.hasFocus = false;
                group.root.accept(self._rendering);
                self._layout.render();
                tip.hide();
              }
            }, Config.LEVEL_CHANGE_DELAY);
          })
          .on('mouseleave', () => {
            hoveredElement = undefined;
            tip.hide();
          })
          .on('click', () => {
            d3.event.stopPropagation();
            if (mustExecuteAddCommand) {
              executeAddCommand();
            }
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
          if (element.isActive) {
            d3.event.stopPropagation();
            if (selectedElement && selectedElement !== element && selectedElement.hasFocus) {
              selectedElement.hasFocus = false;
              selectedElement.accept(self._rendering);
              if (mustExecuteAddCommand) {
                executeAddCommand();
              }
            }
            selectedElement = element;
            element.hasFocus = true;
            element.accept(self._rendering);
          }
        });
        element.svgElement.on('mouseenter', () => {
          if (element.isActive && (!isDragging || isDragging &&
            selectedElement !== element && selectedElement.type === element.type)) {
            hoveredElement = element;
            hoveredElement.svgElement.classed('hovered', true);
            showTooltip();

            if (isDragging && element !== selectedElement && element instanceof BudgetElementGroup) {
              d3.timeout(() => {
                if (isDragging && hoveredElement === element) {
                  element.activeLevel += 1;
                  element.root.accept(self._rendering);
                  self._layout.render();
                  hoveredElement.svgElement.classed('hovered', false);
                  tip.hide();
                }
              }, Config.LEVEL_CHANGE_DELAY);
            }
          }
        });
        element.svgElement.on('mouseover', () => {
          if (element.isActive && !hoveredElement && (!isDragging || isDragging &&
            selectedElement !== element && selectedElement.type === element.type)) {
            hoveredElement = element;
            hoveredElement.svgElement.classed('hovered', true);
            showTooltip();
          }
        });
        element.svgElement.on('mouseleave', () => {
          if (element.isActive && hoveredElement) {
            hoveredElement.svgElement.classed('hovered', false);
            hoveredElement = undefined;
            tip.hide();
          }
        });
        element.svgElement.on('dblclick', () => {
          if (element.isActive) {
            if (mustExecuteAddCommand) {
              executeAddCommand();
            }
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
