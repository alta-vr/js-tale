declare global {
    interface Console {
        success(value: any): void;
        fatal(value: any): void;
    }
}
export declare function initLogger(): void;
export default class Logger {
    tag: any;
    static levels: {
        [name: string]: number;
    };
    constructor(type: any | undefined, minLevel?: number);
    private formatLog;
    thenTrace<T>(message: any): (value: T) => T;
    trace(value: any): void;
    thenLog<T>(message: any): (value: T) => T;
    log(value: any): void;
    thenInfo<T>(message: any): (value: T) => T;
    info(value: any): void;
    thenSuccess<T>(message: any): (value: T) => T;
    success(value: any): void;
    thenWarn<T>(message: any): (value: T) => T;
    warn(value: any): void;
    thenError<T>(message: any): (value: T) => T;
    error(value: any): void;
    thenFatal<T>(message: any): (value: T) => T;
    fatal(value: any): void;
}
