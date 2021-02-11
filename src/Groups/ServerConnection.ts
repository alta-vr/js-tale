import { Connection, BasicWrapper, Message, MessageType } from 'att-websockets';
import { TypedEmitter } from 'tiny-typed-emitter';
import Logger from '../logger';
import { EventEmitter } from 'events';
import { Server } from './Server';
import { HttpError } from '../Core/ApiConnection';


interface ConsoleEvents
{
    'closed' : (console:ServerConnection, data:any)=>void;
    'system' : (console:ServerConnection, data:Message)=>void;
    'error' : (console:ServerConnection, data:any)=>void;
}

const logger = new Logger('ServerConnection');

export class ServerConnection extends TypedEmitter<ConsoleEvents>
{
    server:Server;
    
    private connection:Connection;

    private internalEmitter:EventEmitter = new EventEmitter();

    private initializing?:Promise<void>;

    isAllowed?:boolean;

    constructor (server: Server)
    {
        super();

        console.log("Creating server connection");

        this.server = server;
        this.connection = new Connection(this.server.info.name);
        
        this.connection.onMessage = this.handleMessage.bind(this);
        this.connection.onError = this.handleError.bind(this);
        this.connection.onClose = this.handleClose.bind(this);
    }
    
    reattempt()
    {
        if (this.isAllowed === false)
        {
            this.isAllowed = undefined;

            return this.waitReady();
        }
    }

    waitReady()
    {
        if (this.initializing === undefined)
        {
            console.log("Doing initialize");

            this.initializing = new Promise(async (resolve, reject) =>
            {
                this.server.group.manager.api.fetch('POST', `servers/${this.server.info.id}/console`, {})
                .then(async details =>  
                {      
                    console.log("Received details");
                    console.log(details);

                    if (details.allowed)
                    {
                        logger.success(`Connecting to ${this.server.info.name}`);
                    
                        await this.connection.connect(details.connection.address, details.connection.websocket_port, details.token);
            
                        this.isAllowed = true;
                        this.initializing = undefined;
                        resolve();
                    }
                    else
                    {
                        this.isAllowed = false;
                        this.initializing = undefined;
                        reject();
                    }
                })
                .catch((e:HttpError) =>
                {
                    console.log(e);

                    if (e.code != 403)
                    {
                        logger.error("Unexpected error connecting to server");
                        logger.info(e);
                    }
                    
                    this.initializing = undefined;
                    reject();
                });
            });
        }

        return this.initializing;
    }

    private handleMessage(data:Message)
    {
        switch (data.type)
        {
            case MessageType.SystemMessage:
                this.emit('system', this, data);
            break;

            case MessageType.Subscription:
                this.internalEmitter.emit('SUB' + data.eventType, data.data);
            break;

            case MessageType.CommandResult:
                this.internalEmitter.emit('CR' + data.commandId, data.data);
            break;

            default:
                logger.warn("Unhandled message:");
                logger.info(data);
            break;
        }
    }

    private handleError(data:any)
    {
        logger.error("Connection threw an error");
        logger.info(data);   

        this.emit('error', this, data);
    }

    private handleClose(data:any)
    {
        logger.info("Connection closed");
        logger.info(data);
        
        this.emit('closed', this, data);
    }

    send(command:string) : Promise<any>
    {
        return new Promise((resolve, reject) => 
        {
            var id = this.connection.send(command);

            this.internalEmitter.once('CR' + id, resolve);
        });
    }

    async subscribe(event:string, callback:(result:any)=>void) : Promise<any>
    {
        logger.log("Subscribing to " + event);

        this.internalEmitter.addListener('SUB' + event, callback);

        var result = await this.send('websocket subscribe ' + event);

        if (!!result.Exception)
        {
            logger.error(`Failed to subscribe to ${event}`);
            logger.info(result.Exception);
        }
        else
        {
            logger.log(`Subscribed to ${event} : ${result.ResultString}`);
        }

        return result;
    }

    async unsubscribe(event:string, callback:(result:any)=>void) : Promise<any>
    {
        logger.log("Unsubscribing from " + event);

        this.internalEmitter.removeListener('SUB' + event, callback);
        
        var result = await this.send('websocket unsubscribe ' + event);

        if (!!result.Exception)
        {
            logger.error(`Failed to unsubscribe from ${event}`);
            logger.info(result.Exception);
        }
        else
        {
            logger.log(`Unsubscribed from ${event} : ${result.ResultString}`);
        }

        return result;
    }
    
    disconnect()
    {
        this.connection.terminate();
    }
}
