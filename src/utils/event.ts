/**
 * Defines an event.
 *
 * @see http://stackoverflow.com/questions/12881212/does-typescript-support-events-on-classes
 */
export class Event<T> {
  private _handlers: { handler: {(data?: T): void}, context: any }[] = [];

  /**
   * Registers an handler.
   *
   * @param handler       Handler to register.
   * @param [context]     The context to use with the handler.
   */
  register(handler: { (data?: T): void }, context?: any) {
    if (!context) {
      context = this;
    }
    this._handlers.push({ handler: handler, context: context });
  }

  /**
   * Unregisters an handler.
   *
   * @param handler       Handler to unregister.
   * @param [context]     The context associated with the handler to unregister.
   */
  unregister(handler: { (data?: T): void }, context?: any) {
    if (!context) {
      context = this;
    }
    this._handlers = this._handlers.filter(h => h.handler !== handler && h.context !== context);
  }

  /**
   * Invokes the event.
   *
   * @param [data]        The data to pass to the handlers.
   */
   invoke(data?: T) {
    this._handlers.slice(0).forEach(h => h.handler.call(h.context, data));
  }
}
