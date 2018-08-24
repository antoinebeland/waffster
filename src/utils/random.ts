/**
 * Provides some useful functions for the random.
 *
 * All the following code comes from MDN.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export class Random {
  /**
   * Returns a random number between 0 (inclusive) and 1 (exclusive).
   *
   * @returns {number}    The generated number.
   */
  public static getRandom(): number {
    return Math.random();
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive).
   *
   * @param min           The minimum bound.
   * @param max           The maximum bound.
   * @returns {number}    The generated number.
   */
  public static getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min (included) and max (excluded).
   *
   * @param min           The minimum bound.
   * @param max           The maximum bound.
   * @returns {number}    The generated number.
   */
  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Returns a random integer between min (included) and max (included).
   *
   * @param min           The minimum bound.
   * @param max           The maximum bound.
   * @returns {number}    The generated number.
   */
  public static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
