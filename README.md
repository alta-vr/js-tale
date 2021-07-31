# Work In Progress
Please note this library is a work in progress, although usable, it is prone to changes.
Any thoughts and feedback is always appreciated.

# About
js-tale is a node.js library that eases interaction with A Township Tale's APIs. 

It makes extensive use of object-oriented design, with the goal of making getting started as easy and intuitive as possible.

## Setup

### Dependencies
Firstly, setup a project and install required dependencies.

`npm init`

`npm i js-tale`

`npm i -g typescript ts-node`

`tsc --init`

In `package.json`, add a script called `start`:
`"start": "ts-node ."`

In `tsconfig.json`, set 'target' to `es6` and add 'resolveJsonModule' as `true`.

### Config
You will need to configure client id and secret somewhere that won't be checked into git.
For instance, create a file called `config.json`, and add `config.json` to the `.gitignore`.

This file should contain:
```
{
    "clientId": "<insert id here>",
    "clientSecret": "<insert secret here>",
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
import { Client, ServerConnection } from 'js-tale/dist';
import Logger, { initLogger } from 'js-tale/dist/logger';

import config from './config.json';

initLogger();

const logger = new Logger('Main');

class Main
{
    client:Client = new Client(config);

    async initialize()
    {
        await this.client.initialize();
        
        await this.client.groupManager.groups.refresh(true);

        await this.client.groupManager.acceptAllInvites(true);

        this.client.groupManager.automaticConsole(this.connectionOpened.bind(this));
    }

    private connectionOpened(connection:ServerConnection)
    {
        logger.success(`Connected to ${connection.server.info.name}`);

        connection.on('closed', this.connectionClosed)
    }

    private connectionClosed(connection:ServerConnection)
    {
        logger.warn(`Disconnected from ${connection.server.info.name}`);
    }
}

var main = new Main();
main.initialize();
```

## Connecting to a server
To invite the bot to your server, invite it by it's username or userid (not client id).
With the example above, the bot will automatically accept any invites sent to it (`acceptAllInvites(true)`), both at startup, and while running.

You will also need to modify the permissions for the bot (eg. by selecting in the member list and clicking 'promote to admin') if you wish for it to be able to connect to the server or do other priveleged actions.

The example above also has an `automaticConsole` call, which is used to simplify running a bot, by creating a connection and calling a callback whenever a server comes online.

When your server is booted up (due to someone joining it, or the immediately upon the bot launching, if it's already online), you should receive that callback.

## Modules
Currently att.js has the following modules:

### Client (`Core/Client.ts`)
Wraps Api Connection, Subscription Manager, and Group Manager for convenience.

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

### Console (`Groups/ServerConnection.ts`)
Maintains a websocket connection to a running server.
Allows for subscriptions to be made, and commands to be sent.
