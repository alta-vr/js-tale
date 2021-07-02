import Logger from '../logger';
import { ApiConnection, SubscriptionManager, GroupManager, Config } from "..";

const logger = new Logger('Client');

export default class Client
{
    api:ApiConnection;
    subscriptions:SubscriptionManager;
    groupManager:GroupManager;

    constructor(config:Config)
    {
        this.api = new ApiConnection(config);
        this.subscriptions = new SubscriptionManager(this.api);
        this.groupManager = new GroupManager(this.subscriptions);
    }

    async initialize()
    {
        await this.api.initialize();
        
        await this.subscriptions.initialize();
    }
}