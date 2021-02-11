import { Message } from 'att-websockets';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Server } from './Server';
interface ConsoleEvents {
    'closed': (console: ServerConnection, data: any) => void;
    'system': (console: ServerConnection, data: Message) => void;
    'error': (console: ServerConnection, data: any) => void;
}
export declare class ServerConnection extends TypedEmitter<ConsoleEvents> {
    server: Server;
    private connection;
    private internalEmitter;
    private initializing?;
    isAllowed?: boolean;
    constructor(server: Server);
    reattempt(): Promise<void> | undefined;
    waitReady(): Promise<void>;
    private handleMessage;
    private handleError;
    private handleClose;
    send(command: string): Promise<any>;
    subscribe(event: string, callback: (result: any) => void): Promise<any>;
    unsubscribe(event: string, callback: (result: any) => void): Promise<any>;
    disconnect(): void;
}
export {};
