import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
interface LiveListEvents<T> {
    'create': (item: T) => void;
    'delete': (item: T) => void;
    'update': (item: T, old: T) => void;
}
export default class LiveList<T> extends EventEmitter<LiveListEvents<T>> {
    name: string;
    items: T[];
    isLive: boolean;
    isBlocked: boolean;
    protected map: {
        [index: number]: T;
    };
    private getAll;
    protected getSingle: undefined | ((id: number) => Promise<any>);
    private subscribeToCreate;
    private subscribeToDelete;
    private subscribeToUpdate;
    private getRawId;
    private getId;
    private process;
    constructor(name: string, getAll: () => Promise<any[]>, getSingle: undefined | ((id: number) => Promise<any>), subscribeToCreate: (callback: (data: any) => void) => Promise<any>, subscribeToDelete: (callback: (data: any) => void) => Promise<any>, subscribeToUpdate: undefined | ((callback: (data: any) => void) => Promise<any>), getRawId: (data: any) => number, getId: (item: T) => number, process: (data: any) => T);
    get(id: number): Promise<T>;
    refresh(subscribe?: boolean): Promise<T[]>;
    private block;
    private receiveCreate;
    private receiveDelete;
    receiveUpdate(event: any): void;
}
export {};
