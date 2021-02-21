import Websocket from 'ws';
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { ApiConnection } from '..';
export default class SubscriptionManager {
    emitter: EventEmitter;
    api: ApiConnection;
    ws: Websocket | undefined;
    nextId: number;
    constructor(api: ApiConnection);
    init(): Promise<void>;
    subscribe(event: string, sub: any, callback: (data: any) => void): Promise<unknown>;
    private onMessage;
}
