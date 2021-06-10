import Websocket from 'ws';
import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { ApiConnection } from '..';
import Logger from '../logger';

const logger = new Logger('SubscriptionManager');

export default class SubscriptionManager
{
    emitter: EventEmitter;
    api: ApiConnection;
    ws: Websocket | undefined = undefined;
    nextId: number = 0;

    retryTimeout?:NodeJS.Timeout;

    private migrating?:Promise<void>;

    constructor(api: ApiConnection)
    {
        this.api = api;
        this.emitter = new EventEmitter();
    }

    async init()
    {
        this.ws = await this.createWebsocket();
    }

    private async createWebsocket()
    {
        const headers = { ...await this.api.getHeaders() };

        return new Promise<Websocket>((resolve, reject) =>
        {
            let ws = new Websocket("wss://5wx2mgoj95.execute-api.ap-southeast-2.amazonaws.com/dev", { headers });

            let _this = this;

            function retry(ws:Websocket)
            {
                logger.error("Error connecting API websocket. Retrying in 10s");
                _this.retryTimeout = setTimeout(() => _this.createWebsocket().then(resolve), 10000);
            }

            ws.on('error', retry);

            ws.on('open', () =>
            {   
                ws?.off('error', retry);

                logger.success('Websocket opened.');

                (ws as any).pingInterval = setInterval(() => ws?.ping(), 5 * 60 * 1000);
                (ws as any).migrateTimeout = setTimeout(() => this.migrate(), 110 * 60 * 1000);

                resolve(ws);
            });
            
            ws.on('message', (message: any) =>
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

            ws.on('close', (code, reason) =>
            { 
                clearInterval((ws as any).pingInterval);
                clearTimeout((ws as any).migrate);

                if (code == 1000)
                {
                    logger.info(`WebAPI Websocket closed normally`);
                    return;
                }

                logger.error(`WebAPI Websocket closed. Code: ${code}. Reason: ${reason}.`); 

                this.init();
            });
        });
    }


    async test_migrate()
    {
        return this.migrate();
    }

    private async migrate()
    {
        logger.info("Migrating websocket: Getting migration token");

        var { content } = await this.send('GET', `migrate`);

        var token = JSON.parse(content);

        var oldWs = this.ws;

        logger.info("Migrating websocket: Creating a new websocket");
        
        this.ws = await this.createWebsocket();

        logger.info("Migrating websocket: Pausing outgoing and sending migration token");

        //This tells the server to update all subscriptions in the database to this new connection
        this.migrating = this.send('POST', 'migrate', token);

        await this.migrating;
        
        this.migrating = undefined;

        logger.info("Migrating websocket: Finished - Resumed outgoing and waiting for 10s before destroying old connection");

        //Ensure that any messages in transit are received
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        logger.info("Migrating websocket: Old connection deleting");

        oldWs?.close();
        
        logger.info("Migrating websocket: Old connection deleted");
    }

    subscribe(event: string, sub: any, callback: (data: any) => void)
    {
        if (!this.ws)
        {
            throw new Error("Subscription manager must have init called first");
        }

        this.emitter.on(`${event}-${sub}`, callback);
        
        return this.send('POST', `subscription/${event}/${sub}`);
    }

    async unsubscribe(event:string, sub:any, callback: (data:any) => void)
    {
        if (!this.ws)
        {
            throw new Error("Subscription manager must have init called first");
        }

        this.emitter.off(`${event}-${sub}`, callback);
        
        return await this.send('DELETE', `subscription/${event}/${sub}`);
    }

    async send(method:string, path:string, body?:any) : Promise<any>
    {
        if (!this.ws)
        {
            throw new Error("Subscription manager must have init called first");
        }
        
        if (!!this.migrating)
        {
            //Best to hold off from anything until migration has finished
            await this.migrating;
        }

        var headers = await this.api.getHeaders();
        
        this.nextId++;
        let id = this.nextId;

        this.ws?.send(JSON.stringify({
            id: id,
            method,
            path,
            body,
            authorization: headers["Authorization"]
        }));

        return await new Promise((resolve, reject) => this.emitter.once(`request-${this.nextId}`, data => { data.responseCode == 200 ? resolve(data) : reject(data); }));
    }

    close()
    {
        this.ws?.close()

        if (!!this.retryTimeout)
        {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = undefined;
        }
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
