import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { UserInfo } from '../Core/ApiConnection';
import { Group } from './Group';
import { Console } from './Console';
interface ServerEvents {
    'update': (server: Server, old: ServerData) => void;
    'status': (server: Server, old: ServerData) => void;
}
export interface ServerData {
    id: number;
    name: string;
    online_players: UserInfo[];
    server_status: string;
    scene_index: number;
    region: string;
    online_ping: string | undefined;
    description: string;
    playability: number;
    version: string;
    group_id: number | undefined;
    type: string;
}
export declare class Server extends EventEmitter<ServerEvents> {
    group: Group;
    data: ServerData;
    isOnline: boolean;
    console: Console | undefined;
    constructor(group: Group, data: ServerData);
    private evaluateState;
    onUpdate(oldData: ServerData): void;
    onStatus(data: ServerData): void;
    getConsole(): Promise<Console>;
    private consoleDisconnect;
}
export {};
