import Websocket from 'ws';
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { ApiConnection } from './ApiConnection';
import Logger from '../logger';

const logger = new Logger('SubscriptionManager');

export class SubscriptionManager
{
    emitter: EventEmitter;
    api: ApiConnection;
    ws: Websocket | undefined = undefined;
    nextId: number = 0;
    constructor(api: ApiConnection)
    {
        this.api = api;
        this.emitter = new EventEmitter();
    }
    async init()
    {
        return new Promise<void>((resolve, reject) =>
        {
            this.ws = new Websocket("wss://5wx2mgoj95.execute-api.ap-southeast-2.amazonaws.com/dev", { headers: this.api.headers });
            
            this.ws.on('open', () =>
            {
                resolve();
            });
            
            this.ws.on('message', (message: any) =>
            {
                if (!!message)
                {
                    try
                    {
                        var parsed = JSON.parse(message);
                    }
                    catch (e)
                    {
                        var parsed = message;
                    }
                    try
                    {
                        this.onMessage(parsed);
                    }
                    catch (e)
                    {
                        logger.error(e);
                        logger.error(parsed);
                    }
                }
            });

            this.ws.on('close', (code, reason) =>
            { 
                if (code == 1001)
                {
                    logger.info("Websocket expired, recreating");
                    this.init();
                }
                else
                {
                    logger.error(`WebAPI Websocket closed. Code: ${code}. Reason: ${reason}.`); 
                }
            });
        });
    }

    subscribe(event: string, sub: any, callback: (data: any) => void)
    {
        if (!this.ws)
        {
            throw new Error("Subscription manager must have init called first");
        }

        this.nextId++;
        this.emitter.on(`${event}-${sub}`, callback);
        this.ws.send(JSON.stringify({
            id: this.nextId,
            method: 'POST',
            path: `subscription/${event}/${sub}`,
            authorization: this.api.headers["Authorization"]
        }));

        return new Promise((resolve, reject) => this.emitter.once(`request-${this.nextId}`, data => { data.responseCode == 200 ? resolve(data) : reject(data); }));
    }

    private onMessage(data: any)
    {
        if (!!data)
        {
            if (data.id > 0)
            {
                this.emitter.emit(`request-${data.id}`, data);
                return;
            }
            if (!!data.event)
            {
                data.content = JSON.parse(data.content);
                this.emitter.emit(data.event, data);
                this.emitter.emit(`${data.event}-${data.key}`, data);
            }
            else
            {
                this.emitter.emit('message', data);
            }
        }
    }
}
