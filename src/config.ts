import { GaugeConfig } from './budget/layouts/layout-config';
import { PolygonsGroupConfig, PolygonsGroupOrientation } from './geometry/polygons-group-configs';

/**
 * Defines the configuration values of the application.
 */
export class Config {
  /**
   * The average character size.
   */
  static readonly AVERAGE_CHAR_SIZE = 7.5;

  /**
   * The orientation og the budget elements.
   */
  static readonly BUDGET_ELEMENTS_ORIENTATION = PolygonsGroupOrientation.HORIZONTAL;

  /**
   * The spacing to use for the sub elements of the budget when these elements are active.
   */
  static readonly BUDGET_SUB_ELEMENTS_SPACING = 3;

  /**
   * The configuration of the gauge.
   */
  static readonly GAUGE_CONFIG: GaugeConfig = {
    barWidth: 12.5,
    height: 55,
    interval: [-26000000, 26000000],
    needleRadius: 5.5,
    width: 110,
  };

  /**
   * Indicates if the groups of an element must used different colors.
   */
  static readonly IS_USING_DISTINCT_COLORS = false;

  /**
   * The delay before the active level is changed when an element is hovered.
   */
  static readonly LEVEL_CHANGE_DELAY = 1000;

  /**
   * The minimum amount to show.
   */
  static readonly MIN_AMOUNT = 50000;

  /**
   * The maximum polygons count per line for a group.
   */
  static readonly MAX_COUNT_PER_LINE = 20;

  /**
   * The side length of a square.
   */
  static readonly SIDE_LENGTH = 8;

  /**
   * The transition duration in ms.
   */
  static readonly TRANSITION_DURATION = 350;

  /**
   * The default polygons group configuration to use.
   */
  static readonly DEFAULT_POLYGONS_GROUP_CONFIG: PolygonsGroupConfig = {
    maxCountPerLine: Config.MAX_COUNT_PER_LINE,
    orientation: Config.BUDGET_ELEMENTS_ORIENTATION,
    sideLength: Config.SIDE_LENGTH
  };
}
