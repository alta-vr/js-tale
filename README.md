# Work In Progress
Please note this library is a work in progress, and is not usable by the public yet. It requires OAuth client keys, which are yet to be available. Please look into att-bot-js or att-websockets if you would like to make a bot in the meantime.

# About
att.js is a node.js library that eases interaction with A Township Tale's APIs. 

Unlike the old alta-jsapi, it makes extensive use of object-oriented design, making finding functions, and calling the API much more intuitive.

## Setup
Firstly, install the library `npm i https://github.com/alta-vr/att.js`.

You will need to configure client id and secret somewhere that won't be checked into git.
For instance, create a file called `config.js`, and add `config.js` to the `.gitignore`.

This file should contain:
```module.exports = {
    "client_id": "<insert id here>",
    "client_secret": "<insert secret here>",
    "scope" : "<insert scopes here>",
}```

At this stage, scopes should be:
`ws.group ws.group_members ws.group_servers ws.group_bans ws.group_invites group.join group.leave group.view group.members group.invite server.view server.console`


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
