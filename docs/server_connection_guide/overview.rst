Overview
========

Communication with game servers is done via websockets, an ordered, 2 way stream of messages.

This is done through the ServerConnection class, which can be accessed via GroupManager or Group classes ``automaticConsole`` function, or via the Server ``getConsole`` function.

Interactions between a client application and a game server are best thought about in two categories:

* Commands
* Subscriptions

Commands
--------

Commands are a single operation sent to a server, in the form of a string. Commands are organized into modules, and sometimes, submodules.
A single command can be represented as::
    
    <module> <commmand> [arguments]

For example::

    player kill joel

Commands are sent to the server, executed, and responded to. A client application can choose to await this operation, to ensure it has completed before sending off further commands.
This is not mandatory however, and multiple commands can be sent off without awaiting prior ones. The server is guaranteed to receive these commands in order (due to the nature of websockets), but if a command is asynchronous on the server, it is not guaranteed to have completed before the next received command is started.

Some commands are purely operational, either returning success, or an error. Other commands return data, such as ``player list`` returning an array of players online.

Commands are sent via ``ServerConnection.send(command:string) : Promise<any>``.

Subscriptions
-------------

Subscriptions allow for you to receive a message from the game server, whenever a particular event occurs. Behind the scenes, subscribing or unsubscribing to an event is running a command, though js-api handles this internally, and allows you to conveniently set up a callback for whenever that event is received.

Subscription callbacks always include some data, providing some context and details about the event. For instance, ``PlayerKilled`` includes data about who was killed, and who or what killed them.

Subscriptions are disabled unless activated, and it is recommended that you only subscribe to events that you need to, to avoid excess burden on the server and the network.

Subscriptions are created with ``ServerConnection.subscribe(event:string, callback:(result:any)=>void) : Promise<any>``