((d3, waffster) => {
  const Budget = waffster.Budget;
  const BudgetVisualization = waffster.BudgetVisualization;
  const CommandInvoker = waffster.CommandInvoker;
  const Config = waffster.Config;
  const GridLayout = waffster.GridLayout;

  d3.json('./data/2022.json').then((config) => {
    const svg = d3.select('svg');
    const budget = new Budget(config);
    const visualizationConfig = {
      layout: new GridLayout(budget, svg, {
        amountTextHeight: 20,
        amountTextHeightY: 6,
        averageCharSize: 10.5,
        countPerLine: 4,
        gaugeConfig: {
          barWidth: 17,
          height: 70,
          interval: [-12000000, 12000000],
          needleRadius: 7,
          width: 140,
        },
        horizontalMinSpacing: 30,
        horizontalPadding: 40,
        legend: {
          minAmount: Config.MIN_AMOUNT,
          sideLength: Config.SIDE_LENGTH,
        },
        locale: 'en',
        polygonLength: Config.SIDE_LENGTH * Config.MAX_COUNT_PER_LINE,
        titleLineHeight: 16,
        transitionDuration: 500,
        verticalMinSpacing: 40,
        verticalPadding: 30
      }, 6),
      polygonsGroupConfig: Config.DEFAULT_POLYGONS_GROUP_CONFIG
    };

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

    const budgetVisualization = new BudgetVisualization(budget, svg, visualizationConfig.layout, commandInvoker);
    budgetVisualization.initialize();
  });
})(d3, waffster);
