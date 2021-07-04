import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';

import chalk from 'chalk';
import Logger from '../logger';
import { ApiConnection, SubscriptionManager } from '..';

const logger = new Logger('LiveList');

interface LiveListEvents<T> 
{
    'create': (item : T) => void;
    'delete': (item : T) => void;
    'update': (item : T, old : T) => void;
}

export interface LiveListDefinition<T>
{
    name: string;
    getAll: string|(() => Promise<any[]>);
    getSingle?: string|((id:number) => Promise<any>);
    subscribeToCreate?: string;
    subscribeToUpdate?: string;
    subscribeToDelete?: string;
    getRawId: (data: any) => number;
    getId: (item: T) => number;
    process: (data: any) => T;
}

export default class LiveList<T> extends EventEmitter<LiveListEvents<T>> 
{
    name: string;
    items: T[] = [];
    isLive: boolean = false;
    isBlocked: boolean = false;

    protected map:{[index:number]:T} = {};

    private api: ApiConnection;
    private subscriptionManager: SubscriptionManager;

    private getAll: () => Promise<any[]>;
    protected getSingle: undefined|((id:number) => Promise<any>);
    private subscribeToCreate: (callback: (data: any) => void) => Promise<any>;
    private subscribeToDelete: (callback: (data: any) => void) => Promise<any>;
    private subscribeToUpdate: undefined|((callback: (data: any) => void) => Promise<any>);
    private getRawId: (data: any) => number;
    private getId: (a: T) => number;
    private process: (data: any) => T;

    private currentRefresh: Promise<T[]>|undefined;

    //Expandable lists mean that 'get' requests supports items outside of the 'list'
    //A key example of this is the 'groups' list, which allows you to get groups that aren't in the list (eg. open/public)
    private isExpandable: boolean = false;
    
    constructor(subscriptionManager:SubscriptionManager, definition:LiveListDefinition<T>, getSub:()=>any)
    {
        super();

        this.api = subscriptionManager.api;
        this.subscriptionManager = subscriptionManager;

        this.name = definition.name;
        this.getAll = typeof definition.getAll === 'string' ? () => this.api.fetch('GET', definition.getAll as string) : definition.getAll;
        
        if (!!definition.getSingle)
        {
            this.getSingle = typeof definition.getSingle === 'string' ? id => this.api.fetch('GET', `${definition.getSingle}/${id}`) : definition.getSingle;
        }

        function createSubscribe(name?:string)
        {
            return !name ? undefined : (callback:(data:any)=>void) => subscriptionManager.subscribe(name, getSub(), callback);
        }

        this.subscribeToCreate = createSubscribe(definition.subscribeToCreate)!;
        this.subscribeToDelete = createSubscribe(definition.subscribeToDelete)!;
        this.subscribeToUpdate = createSubscribe(definition.subscribeToUpdate);

        this.getRawId = definition.getRawId;
        this.getId = definition.getId;
        this.process = definition.process;
        
        this.api.sessionManager.on('logged-in', this.handleLoggedIn.bind(this));
        this.api.sessionManager.on('logged-out', this.clear.bind(this));
    }

    markExpandable()
    {
        this.isExpandable = true;
    }

    private currentUser()
    {
        return this.api.sessionManager.userInfo?.id;
    }

    private ensureSameUser(userId:number|undefined)
    {
        if (userId != this.currentUser())
        {
            throw new Error("logged out");
        }
    }
    
    private handleLoggedIn()
    {
        if (this.isLive)
        {
            this.isLive = false;
            this.isBlocked = false;
            this.refreshInternal();
        }
    }

    async get(id:number) : Promise<T>
    {
        var cacheId = this.currentUser();

        if (!!this.currentRefresh)
        {
            await this.currentRefresh;
            
            this.ensureSameUser(cacheId);
        }

        var couldBeExternal = this.isExpandable || !this.isLive;

        if (couldBeExternal && !this.map[id] && !!this.getSingle)
        {
            var item = await this.getSingle(id);

            this.ensureSameUser(cacheId);

            if (this.isExpandable)
            {
                //Don't add to the list, as it may not belong there
                return this.process(item);
            }

            this.receiveCreate({content:item});
        }

       return this.map[id]; 
    }

    async refresh(subscribe: boolean = false): Promise<T[]>
    {
        if (!this.currentRefresh)
        {
            this.currentRefresh = this.refreshInternal(subscribe);
        }

        var result = await this.currentRefresh;

        this.currentRefresh = undefined;

        return result;
    }

    private async refreshInternal(subscribe: boolean = false): Promise<T[]>
    {
        if (this.isLive || this.isBlocked)
        {
            return this.items;
        }

        var cacheId = this.currentUser();

        if (subscribe)
        {
            var promises = [];

            this.isLive = true;

            promises.push(this.subscribeToCreate(this.receiveCreate.bind(this)).then(() => logger.log(`Subscribed to ${this.name} create`)).catch(error =>
            {
                if (error.responseCode == 404)
                    this.block();
            }));
            
            
            promises.push(this.subscribeToDelete(this.receiveDelete.bind(this)).then(() => logger.log(`Subscribed to ${this.name} delete`)).catch(error =>
            {
                if (error.responseCode == 404)
                    this.block();
            }));

            if (!!this.subscribeToUpdate)
            {
                promises.push(this.subscribeToUpdate(this.receiveUpdate.bind(this)).then(() => logger.log(`Subscribed to ${this.name} update`)).catch(error =>
                {
                    if (error.responseCode == 404)
                        this.block();
                }));
            }

            await Promise.all(promises);

            this.ensureSameUser(cacheId);
        }
        
        try
        {
            var results = await this.getAll();

            this.ensureSameUser(cacheId);

            if (results === undefined)
            {
                logger.info(`getAll returned undefined in ${this.name}`);

                results = [];
            }
        }
        catch (e)
        {
            logger.error("Error getting items for LiveList");
            logger.info(e);
            
            results = [];
            
            this.block();
        }
        
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            
            var id = this.getId(item);
        
            if (!results.some((result: any) => this.getRawId(result) == id))
            {
                this.items.splice(i, 1);
                i--;
                delete this.map[id];
                this.emit('delete', item);
            }
        }
        
        for (var result of results)
        {
            this.receiveCreate({ content: result });
        }
        
        return this.items;
    }
    
    private block()
    {
        if (!this.isBlocked)
        {
            this.isBlocked = true;
            logger.error("Not allowed to access " + this.name);
        }
    }
    
    private receiveCreate(event: any)
    {
        if (!event.content)
        {
            logger.info(event);
        }

        try
        {
            var id = this.getRawId(event.content);
        }
        catch (e)
        {
            logger.error("Error in receive create");
            logger.info(e);
            throw e;
        }

        if (!this.items.some(item => this.getId(item) == id))
        {
            var item = this.process(event.content);
            this.items.push(item);
            this.map[id] = item;
            this.emit('create', item);
        }
    }
    
    private receiveDelete(event: any)
    {
        var id = this.getRawId(event.content);
        var index = this.items.findIndex(item => this.getId(item) == id);
    
        if (index >= 0)
        {
            var item = this.items.splice(index, 1)[0];
            delete this.map[id];
            this.emit('delete', item);
        }
    }

    receiveUpdate(event: any)
    {
        var id = this.getRawId(event.content);
        var index = this.items.findIndex(item => this.getId(item) == id);
    
        if (index >= 0)
        {
            var cache = { ...this.items[index] };

            Object.assign(this.items[index], this.process(event.content));

            this.emit('update', this.items[index], cache);
        }
    }

    clear()
    {
        var cache = this.items;

        this.items = [];
        this.isBlocked = false;
        this.currentRefresh = undefined;

        for (var item of cache)
        {
            this.emit('delete', item);
        }
    }
}
