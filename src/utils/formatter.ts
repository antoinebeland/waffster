const DEFAULT_LOCALE = 'fr';

export class Formatter {
  static formatAmount(amount: number, locale = DEFAULT_LOCALE): string {
    let result = amount / Math.pow(10, 6);
    if (Math.abs(result) >= 1) {
      if (locale === DEFAULT_LOCALE) {
        return `${result.toFixed(2).replace('.', ',')} G$`;
      }
      return `$${result.toFixed(2)}B`;
    }
    result = amount / Math.pow(10, 3);
    if (locale === DEFAULT_LOCALE) {
      return `${result.toFixed(0).replace('.', ',')} M$`;
    }
    return `$${result.toFixed(0)}M`;
  }

  /**
   * Formats the specified name to retrieve the ID associated.
   *
   * @param {string} name             The name to transform.
   * @param {string} spaceCharacter   The space character to use. By default, the character is dash (-).
   * @returns {string}                The ID associated with the name specified.
   */
  static formatId(name: string, spaceCharacter = '-'): string {
    return name.trim().toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(/\s/g, spaceCharacter);
  }
}
