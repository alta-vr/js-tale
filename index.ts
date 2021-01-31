const config = require('./config');

import { ApiConnection } from './Core/ApiConnection';
import { SubscriptionManager } from './Core/SubscriptionManager';
import { GroupManager } from './Groups/GroupManager';

import Logger, { initLogger } from './logger';
import { Console } from './Groups/Console';

initLogger();

const logger = new Logger('Main');

class Main
{
    api:ApiConnection = new ApiConnection();
    subscriptions:SubscriptionManager = new SubscriptionManager(this.api);
    groupManager:GroupManager = new GroupManager(this.subscriptions);

    async init()
    {
        await this.api.login(config);
        
        await this.subscriptions.init();

        await this.groupManager.groups.refresh(true);

        await this.groupManager.acceptAllInvites(true);

        await this.groupManager.automaticConsole(this.handleConnection.bind(this));
    }

    private handleConnection(connection:Console)
    {
        logger.success(`Connected to ${connection.server.data.name}`);
    }
}

var main = new Main();
main.init();