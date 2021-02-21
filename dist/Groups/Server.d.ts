import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { UserInfo } from '../Core/ApiConnection';
import Group from './Group';
import ServerConnection from './ServerConnection';
interface ServerEvents {
    'update': (server: Server, old: ServerInfo) => void;
    'status': (server: Server, old: ServerInfo) => void;
}
export interface ServerInfo {
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
export default class Server extends EventEmitter<ServerEvents> {
    group: Group;
    info: ServerInfo;
    isOnline: boolean;
    console: ServerConnection | undefined;
    constructor(group: Group, info: ServerInfo);
    private evaluateState;
    onUpdate(oldInfo: ServerInfo): void;
    onStatus(info: ServerInfo): void;
    getConsole(): Promise<ServerConnection>;
    private consoleDisconnect;
}
export {};
