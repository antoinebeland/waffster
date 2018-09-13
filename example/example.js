((d3, bv) => {
  const BarsLayout = bv.BarsLayout;
  const Budget = bv.Budget;
  const BudgetVisualization = bv.BudgetVisualization;
  const CommandInvoker = bv.CommandInvoker;
  const Config = bv.Config;
  const GridLayout = bv.GridLayout;
  const HorizontalBarsLayout = bv.HorizontalBarsLayout;
  const Orientation = bv.Orientation;

  d3.json('./data/2018-mobile.json').then((config) => {
    const svg = d3.select('svg');
    const budget = new Budget(config);
    const visualizationConfigs = [
      {
        layout: new GridLayout(budget, svg, {
          amountTextHeight: 15,
          averageCharSize: Config.AVERAGE_CHAR_SIZE,
          horizontalMinSpacing: 30,
          horizontalPadding: 20,
          polygonLength: Config.SIDE_LENGTH * Config.MAX_COUNT_PER_LINE,
          titleLineHeight: 15,
          transitionDuration: 500,
          verticalMinSpacing: 50,
          verticalPadding: 30,
          isGaugeDisplayed: false
        }),
        polygonsGroupConfig: Config.DEFAULT_POLYGONS_GROUP_CONFIG
      },
      {
        layout: new HorizontalBarsLayout(budget, svg, {
          amountTextHeight: 15,
          averageCharSize: Config.AVERAGE_CHAR_SIZE,
          horizontalMinSpacing: 30,
          horizontalPadding: 20,
          polygonLength: 5 * 5,
          titleLineHeight: 15,
          transitionDuration: 500,
          verticalMinSpacing: 20,
          verticalPadding: 30
        }),
        polygonsGroupConfig: {
          maxCountPerLine: 5,
          orientation: Orientation.VERTICAL,
          sideLength: 5
        }
      },
      {
        layout: new BarsLayout(budget, svg, {
          amountTextHeight: 15,
          averageCharSize: Config.AVERAGE_CHAR_SIZE,
          horizontalMinSpacing: 30,
          horizontalPadding: 40,
          polygonLength: 12 * 5,
          titleLineHeight: 15,
          transitionDuration: 500,
          verticalMinSpacing: 30,
          verticalPadding: 30
        }),
        polygonsGroupConfig: {
          maxCountPerLine: 12,
          orientation: Orientation.HORIZONTAL,
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
})(d3, budgetviz);
