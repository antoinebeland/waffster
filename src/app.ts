import * as d3 from 'd3';

import { Budget } from './budget/budget';
import { BudgetConfig } from './budget/budget-config';
import { BudgetVisualization } from './budget/budget-visualization';
import { CommandInvoker } from './budget/commands/command-invoker';
import { BarsLayout } from './budget/layouts/bars-layout';
import { GridLayout } from './budget/layouts/grid-layout';
import { HorizontalBarsLayout } from './budget/layouts/horizontal-bars-layout';
import { Config } from './config';
import { PolygonsGroupOrientation } from './geometry/polygons-group-configs';

d3.json('./data/2018/2018.json').then((config: BudgetConfig) => {
  const svg = d3.select('svg');
  const budget = new Budget(config);
  const visualizationConfigs = [
    {
      layout: new GridLayout(budget, svg, {
        averageCharSize: Config.AVERAGE_CHAR_SIZE,
        horizontalMinSpacing: 30,
        horizontalPadding: 40,
        polygonLength: Config.SIDE_LENGTH * Config.MAX_COUNT_PER_LINE,
        transitionDuration: 500,
        verticalMinSpacing: 30,
        verticalPadding: 30
      }),
      polygonsGroupConfig: Config.DEFAULT_POLYGONS_GROUP_CONFIG
    },
    {
      layout: new HorizontalBarsLayout(budget, svg, {
        averageCharSize: Config.AVERAGE_CHAR_SIZE,
        horizontalMinSpacing: 30,
        horizontalPadding: 20,
        polygonLength: 5 * 5,
        transitionDuration: 500,
        verticalMinSpacing: 20,
        verticalPadding: 30
      }),
      polygonsGroupConfig: {
        maxCountPerLine: 5,
        orientation: PolygonsGroupOrientation.VERTICAL,
        sideLength: 5
      }
    },
    {
      layout: new BarsLayout(budget, svg, {
        averageCharSize: Config.AVERAGE_CHAR_SIZE,
        horizontalMinSpacing: 30,
        horizontalPadding: 40,
        polygonLength: 12 * 5,
        transitionDuration: 500,
        verticalMinSpacing: 30,
        verticalPadding: 30
      }),
      polygonsGroupConfig: {
        maxCountPerLine: 12,
        orientation: PolygonsGroupOrientation.HORIZONTAL,
        sideLength: 5
      }
    }
  ];

  const layoutButtons = d3.select('#layouts')
    .selectAll('button')
    .data(visualizationConfigs);

  let activeIndex = 0;
  layoutButtons.on('click', function(d, i) {
    if (activeIndex === i) {
      return;
    }
    activeIndex = i;
    layoutButtons.classed('selected', false);
    d3.select(this).classed('selected', true);
    budgetVisualization.update(d.layout, d.polygonsGroupConfig);
  });

  const commandInvoker = new CommandInvoker();
  commandInvoker.onCommandInvoked.register(() => {
    console.log(`Budget state: ${budget.summary.state}`);
    undoButton.property('disabled', !commandInvoker.canUndo);
    redoButton.property('disabled', !commandInvoker.canRedo);
  });
  const undoButton = d3.select('#undo')
    .on('click', () => commandInvoker.undo());
  const redoButton = d3.select('#redo')
    .on('click', () => commandInvoker.redo());

  let activeLevel = 0;
  const upButton = d3.select('#up')
    .on('click', () => {
      if (activeLevel > 0) {
       budgetVisualization.activeLevel = --activeLevel;
      }
      upButton.property('disabled', activeLevel <= 0);
      downButton.property('disabled', activeLevel >= 2);
    });
  const downButton = d3.select('#down')
    .on('click', () => {
      if (activeLevel < 2) {
        budgetVisualization.activeLevel = ++activeLevel;
      }
      upButton.property('disabled', activeLevel <= 0);
      downButton.property('disabled', activeLevel >= 2);
    });

  const budgetVisualization = new BudgetVisualization(budget, svg, visualizationConfigs[0].layout, commandInvoker);
  budgetVisualization.initialize();
});
