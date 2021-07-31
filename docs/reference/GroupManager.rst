.. _GroupManager:

GroupManager
===================

Manages the groups, invites, and requests of the logged in user/bot.

``groups : LiveList<Group>``
    A list of all groups the user is a member of

``invites : LiveList<GroupInvite>``
    A list of all invites the user has received

``requests : LiveList<GroupRequest>``
    A list of all join requests the user has sent

``join(id:number) : Promise<void>``
    Requests to join a server

.. note:: A bot client is unable to send join requests to a server.

``acceptAllInvites(subscribe: boolean) : Promise<void>``
    A helper function to refresh the invite list, and then accept all invites. Optionally, it can subscribe to accept all future invites too.

``automaticConsole(callback: (connection:ServerConnection) => void) : Promise<void>``
    A helper functon to refresh and subscribe to all groups, and their servers, and create a connection as soon as any of them come online.