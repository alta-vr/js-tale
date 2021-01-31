import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { UserInfo } from '../Core/ApiConnection';
import { Group } from './Group';
import Logger from '../logger';

import { Connection, Message, MessageType } from 'att-websockets';
import { Console } from './Console';

interface ServerEvents
{
    'update' : (server:Server, old:ServerData)=>void;
    'status' : (server:Server, old:ServerData)=>void;
}

export interface ServerData
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
    data:ServerData;

    isOnline:boolean = false;

    console:Console|undefined = undefined;

    constructor(group:Group, data:ServerData)
    {
        super();

        this.group = group;
        this.data = data;
        
        this.evaluateState();
    }
    
    private evaluateState()
    {
        this.isOnline = !!this.data.online_ping && Date.now() - Date.parse(this.data.online_ping) < 10 * 60 * 1000;
    }

    //Provided by LiveList update
    onUpdate(oldData:ServerData)
    {
        this.evaluateState();

        this.emit('update', this, oldData);
    }

    onStatus(data:ServerData)
    {
        var cache = { ...this.data };

        Object.assign(this.data, data);

        this.evaluateState();

        this.emit('status', this, cache );
    }

    async getConsole()
    {
        if (this.console === undefined)
        {
            this.console = new Console(this);

            this.console.on('closed', this.consoleDisconnect.bind(this));
        }

        await this.console.waitReady();

        return this.console;
    }

    private consoleDisconnect()
    {
        logger.error(`Console to ${this.data.name} disconnected.`);

        this.console = undefined;
    }
}