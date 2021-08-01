The Big Picture
===============

The ecosystem of A Township Tale is made up of multiple services related to js-tale. 

These services are:

* Client Applications
* Alta Auth Servers
* Alta Web API
* Individual game servers (eg. 'A Tutorial Tale')

js-tale interacts with each of these services for different reasons, and in different ways. Understanding each of these, and their purpose, is key to reducing misunderstandings when using js-tale.

Client Applications
-------------------

A client application is exactly what you are developing. It could be a website with a "Sign In with Alta" (SSO) feature, or a Bot to automate server commands.

These applications each have a unique "Client ID" with which they operate.

The available functionality to a client depends on the type of client (SSO vs. Bot), as well as the scopes available to it. This will be delved into further in the next section.

Alta Auth Servers
-----------------

When a player logs in to an SSO application, or a bot application boots up, this is an interaction with Altas authorization servers. 

In the case of SSO, a user may be redirected to a page for them to log in, and grant permission for your application to see some of their information, or make actions on their behalf. 

Otherwise, these servers predominantly act "behind the scenes", as js-tale will handle the intricacies of logging in, refreshing login, and managing authorization.

Alta Web API
------------

Altas Web API is a contact point for a wide range of functionality. It has endpoints related to friends, groups, servers, and more. Access to these endpoints is limited by the scopes available to a client application.

The API also has support for websocket connections, allowing you to subscribe to various events, such as incoming friend requests, servers changing status, or members joining a group.

The API is used to gain permission to contact a game server, but *is not* involved in sending commands, or subscribing to events from the game server.

Game Servers
------------

A game server is an individual server running the game. When you join a server in game, you are connecting to one of these game servers. At any one time, there could be thousands of these servers running.

It is with game servers that commands can be sent in order to post items, teleport players, or subscribe to events such as players being killed.

A Bot client is required to not only be invited to a group, but be promoted to a role with console permissions, in order to connect to a game server.