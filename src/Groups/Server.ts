import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { UserInfo } from '../Core/ApiConnection';
import { Group } from './Group';
import Logger from '../logger';

import { Connection, Message, MessageType } from 'att-websockets';
import { ServerConnection } from './ServerConnection';

interface ServerEvents
{
    'update' : (server:Server, old:ServerInfo)=>void;
    'status' : (server:Server, old:ServerInfo)=>void;
}

export interface ServerInfo
{
    id: number;
    name: string;
    online_players: UserInfo[];
    server_status: string;
    scene_index: number;
    region: string;
    online_ping: string|undefined;
    description: string;
    playability: number;
    version: string;
    group_id: number|undefined;
    type: string;
} 

const logger = new Logger('Server');

export class Server extends EventEmitter<ServerEvents>
{
    group:Group;
    info:ServerInfo;

    isOnline:boolean = false;

    console:ServerConnection|undefined = undefined;

    constructor(group:Group, info:ServerInfo)
    {
        super();

        this.group = group;
        this.info = info;
        
        this.evaluateState();
    }
    
    private evaluateState()
    {        
        this.isOnline = !!this.info.online_ping && Date.now() - Date.parse(this.info.online_ping) < 10 * 60 * 1000;
    }

    //Provided by LiveList update
    onUpdate(oldInfo:ServerInfo)
    {
        this.evaluateState();

        this.emit('update', this, oldInfo);
    }

    onStatus(info:ServerInfo)
    {        
        var cache = { ...this.info };

        Object.assign(this.info, info);

        this.evaluateState();
        
        logger.info(`${this.info.name} received status. Online: ${this.isOnline}. Players: ${!this.info.online_players ? 0 : this.info.online_players.length}`)

        this.emit('status', this, cache );
    }

    async getConsole()
    {
        if (this.console === undefined)
        {
            this.console = new ServerConnection(this);

            this.console.on('closed', this.consoleDisconnect.bind(this));
        }

        await this.console.waitReady();

        return this.console;
    }

    private consoleDisconnect()
    {
        logger.error(`Console to ${this.info.name} disconnected.`);

        this.console = undefined;
    }
}