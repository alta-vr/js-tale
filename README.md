# Work In Progress
Please note this library is a work in progress, and is not usable by the public yet. It requires OAuth client keys, which are yet to be available. Please look into att-bot-js or att-websockets if you would like to make a bot in the meantime.

# About
js-tale is a node.js library that eases interaction with A Township Tale's APIs. 

Unlike the old alta-jsapi, it makes extensive use of object-oriented design, making finding functions, and calling the API much more intuitive.

## Setup

### Dependencies
Firstly, setup a project and install required dependencies.

`npm init`

`npm i js-tale`

`npm i typescript --save-dev`

`npm i ts-node --save-dev`

`tsc --init`

In `package.json`, add a script called `start`:
`"start": "ts-node ."`

### Config
You will need to configure client id and secret somewhere that won't be checked into git.
For instance, create a file called `config.js`, and add `config.js` to the `.gitignore`.

This file should contain:
```
module.exports = {
    "client_id": "<insert id here>",
    "client_secret": "<insert secret here>",
    "scope" : "<insert scopes here>",
}
```

At this stage, scopes should be:
`ws.group ws.group_members ws.group_servers ws.group_bans ws.group_invites group.info group.join group.leave group.view group.members group.invite server.view server.console`

### index.ts
Create a file called `index.ts`.

This is the main entry point of your bot.
Here's an example of a bot which will automatically connect to available servers.

```
const config = require('./config');

import { ApiConnection } from 'js-tale/dist/Core/ApiConnection';
import { SubscriptionManager } from 'js-tale/dist/Core/SubscriptionManager';
import { GroupManager } from 'js-tale/dist/Groups/GroupManager';

import Logger, { initLogger } from 'js-tale/dist/logger';
import { Console } from 'js-tale/dist/Groups/Console';

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

        this.groupManager.automaticConsole(this.connectionOpened.bind(this));
    }

    private connectionOpened(connection:Console)
    {
        logger.success(`Connected to ${connection.server.data.name}`);

        connection.on('closed', this.connectionClosed)
    }

    private connectionClosed(connection:Console)
    {
        logger.warn(`Disconnected from ${connection.server.data.name}`);
    }
}

var main = new Main();
main.init();
```

## Modules
Currently att.js has the following modules:

### Api Connection (`Core/ApiConnection.ts`)
Provides an access point to the API. Handles login, and fetch requests.

### Subscription Manager (`Core/SubscriptionManager.ts`)
Allows for subscriptions to the API, such as when invites to groups are received.

### Group Manager (`Groups/GroupManager.ts`)
Manages a list of current groups and group invites.
Also provides a high level functionality to automatically connect to any available servers, with a callback when connections are created.

> Note, bots are unable to request to join groups, they may only accept invites.

### Group (`Groups/Group.ts`)
Manages group members, invites, and join requests.
Also provides a list of group servers, with high level functionality to automatically connect to the groups servers, with a callback when connections are created.

### Server (`Groups/Server.ts`)
Maintains information about a server and its status.
Allows for the creation of websocket connections to the server when running.

### Console (`Groups/Console.ts`)
Maintains a websocket connection to a running server.
Allows for subscriptions to be made, and commands to be sent.
