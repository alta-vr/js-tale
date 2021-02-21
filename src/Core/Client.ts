import Logger from '../logger';
import { ApiConnection, SubscriptionManager, GroupManager, Config } from "..";

const logger = new Logger('Client');

export default class Client
{
    api:ApiConnection = new ApiConnection();
    subscriptions:SubscriptionManager = new SubscriptionManager(this.api);
    groupManager:GroupManager = new GroupManager(this.subscriptions);

    async init(config:Config)
    {
        await this.api.login(config);
        
        await this.subscriptions.init();
    }
}