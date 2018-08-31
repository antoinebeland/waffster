export declare class Event<T> {
    private _handlers;
    register(handler: {
        (data?: T): void;
    }, context?: any): void;
    unregister(handler: {
        (data?: T): void;
    }, context?: any): void;
    invoke(data?: T): void;
}
