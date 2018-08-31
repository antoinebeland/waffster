import { PolygonsGroupConfig, PolygonsGroupOrientation } from './geometry/polygons-group-configs';
export declare class Config {
  static readonly AVERAGE_CHAR_SIZE: number;
  static readonly BUDGET_ELEMENTS_ORIENTATION: PolygonsGroupOrientation;
  static readonly BUDGET_SUB_ELEMENTS_SPACING: number;
  static readonly GAUGE_CONFIG: {
    barWidth: number;
    height: number;
    interval: number[];
    needleRadius: number;
    width: number;
  };
  static readonly IS_USING_DISTINCT_COLORS: boolean;
  static readonly LEVEL_CHANGE_DELAY: number;
  static readonly MIN_AMOUNT: number;
  static readonly MAX_COUNT_PER_LINE: number;
  static readonly SIDE_LENGTH: number;
  static readonly TRANSITION_DURATION: number;
  static readonly DEFAULT_POLYGONS_GROUP_CONFIG: PolygonsGroupConfig;
}
