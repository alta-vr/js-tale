.. _Group:

Group
===================

Represents a single Group

``info : GroupInfo``
    Information about the group

``member? : GroupMember``
    The users membership in the Group

``members : LiveList<GroupMember>``
    A list of all members in the group
    
``bans : LiveList<GroupMemberBan>``
    A list of all bans from the group

``invites : LiveList<GroupMemberInvite>``
    A list of all invites sent out from the group
        
``requests : LiveList<GroupMemberRequest>``
    A list of all requests to join the group
    
``servers : GroupServerList``
    A list of all servers in the group

``leave() : Promise<void>``
    Leaves the group
    
``invite(userId: number) : Promise<void>``
    Invites a user to the group
    
``editInfo(edit: any) : Promise<void>``
    Edits the group information

``automaticConsole(callback: (connection:ServerConnection) => void) : Promise<void>``
    A helper functon to refresh and subscribe to all servers, and create a connection as soon as any of them come online.