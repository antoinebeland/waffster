/**
 * Defines the possible orientation of a polygons group.
 */
export enum PolygonsGroupOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

/**
 * Defines the base of a polygons group configuration.
 */
export interface PolygonsGroupConfig {
  /**
   * The maximum polygons count per line.
   */
  maxCountPerLine: number;

  /**
   * The orientation of the group. By default, the orientation is HORIZONTAL.
   */
  orientation?: PolygonsGroupOrientation;

  /**
   * The length of a polygon side.
   */
  sideLength: number;

  /**
   * The starting position of the group. By default, the starting position is 0.
   */
  startingPosition?: number;
}

/**
 * Checks if the specified configuration has all the base properties.
 *
 * @param config        The configuration to validate.
 * @return {boolean}    TRUE of the configuration has all the base properties. FALSE otherwise.
 */
export function isPolygonsGroupConfig(config: any): boolean {
  return config !== undefined &&
    config.maxCountPerLine !== undefined && !isNaN(config.maxCountPerLine) && config.maxCountPerLine > 0 &&
    (config.orientation === undefined || (<any>Object).values(PolygonsGroupOrientation).includes(config.orientation)) &&
    config.sideLength !== undefined && !isNaN(config.sideLength) && config.sideLength > 0 &&
    (config.startingPosition === undefined ||
      config.startingPosition >= 0 && config.startingPosition < config.maxCountPerLine);
}
