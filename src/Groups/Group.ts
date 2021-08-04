import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import GroupInfo from './GroupInfo';
import GroupManager from './GroupManager';
import LiveList, { LiveListDefinition } from '../Core/LiveList';
import GroupMember from './GroupMember';
import GroupMemberRequest from './GroupMemberRequest';
import GroupMemberInvite from './GroupMemberInvite';
import GroupMemberBan from './GroupMemberBan';
import Server, { ServerInfo } from './Server';
import ServerConnection from "./ServerConnection";
import Logger from '../logger';
import { ApiConnection, SubscriptionManager } from '..';
import Permission from './Permission';


interface GroupEvents
{
    'member-create' : (invite:GroupMember)=>void,
    'member-delete' : (invite:GroupMember)=>void,
    'invite-create' : (invite:GroupMember)=>void,
    'invite-delete' : (invite:GroupMember)=>void,
    'ban-create' : (invite:GroupMember)=>void,
    'ban-delete' : (invite:GroupMember)=>void,
    'request-create' : (invite:GroupMember)=>void,
    'request-delete' : (invite:GroupMember)=>void,
    'server-create' : (invite:Server)=>void,
    'server-delete' : (invite:Server)=>void,
    'update' : (info:Group)=>void
}

export class GroupMemberList<T extends GroupMember> extends LiveList<T>
{
    constructor(subscriptionManager: SubscriptionManager, definition: LiveListDefinition<T>, groupId: number)
    {
        super(subscriptionManager, definition, () => groupId);
    }

    async find(item:number|string) : Promise<T|undefined>
    {
        if (typeof item == 'string')
        {
            var parsed = parseInt(item);

            if (!isNaN(parsed))
            {
                return await super.get(parsed);
            }
            
            item = item.toLowerCase();
            return this.items.find(test => test.username.toLowerCase() == item);
        }

        return await super.get(item);
    }
}

export class GroupServerList extends LiveList<Server>
{
    group: Group;
    manager: GroupManager;
    isStatusLive: boolean = false;

    constructor(subscriptionManager:SubscriptionManager, group:Group)
    {
        super(subscriptionManager, {
            name: `${group.info.name} servers`,
            getAll: () => new Promise((resolve, reject) => 
            {
                if (!!group.info.servers)
                {
                    resolve(group.info.servers);
                }
                else if (!!this.getSingle)
                {
                    this.getSingle(group.info.id)
                    .then(info => resolve(info.servers))
                    .catch(reject);
                }
            }),
            subscribeToCreate: 'group-server-create',
            subscribeToUpdate: 'group-server-update',
            subscribeToDelete: 'group-server-delete',
            getRawId: data => data.id,
            getId: server => server.info.id,
            process: (existing, data) => new Server(group, data)
        }, 
        () => group.info.id);
        
        this.group = group;
        this.manager = group.manager;
    }

    async refreshStatus(subscribe: boolean = false)
    {
        if (this.isStatusLive)
        {
            return this.items;
        }

        if (subscribe)
        {
            this.isStatusLive = true;
            
            this.manager.subscriptions.subscribe('group-server-status', this.group.info.id, this.onStatus.bind(this)).then(() => logger.log(`Subscribed to ${this.group.info.name} status`)).catch(error =>
            {
                logger.error(`Error subscribing to status for ${this.group.info.name}`);
                logger.info(error);
            });
        }

        for (var server of this.items)
        {
            await this.manager.api.fetch('GET', `servers/${server.info.id}`)
            .then(data => server.onStatus(data))
            .then(logger.thenInfo(`Refreshed server info for ${server.info.name} (${server.info.id})`))
            .catch(e => 
            {
                logger.error("Error getting server info for " + server.info.name);
                logger.info(e);
            })
        }

        return this.items;
    }
    
    async onStatus(data:any)
    {
        var server = await this.get(data.content.id);

        if (!!server)
        {
            server.onStatus(data.content);
        }
        else
        {
            logger.error(`Unknown server in ${this.group.info.name}`);
            console.log(data);
        }
    }
}

const logger = new Logger('Group');


export default class Group extends EventEmitter<GroupEvents>
{
    manager: GroupManager;
    info: GroupInfo;
    member: GroupMember|undefined;
    invites: GroupMemberList<GroupMemberInvite>;
    members: GroupMemberList<GroupMember>;
    bans: GroupMemberList<GroupMemberBan>;
    requests: GroupMemberList<GroupMemberRequest>;
    servers: GroupServerList;

    private isConsoleAutomatic:boolean = false;

    constructor(manager: GroupManager, info: GroupInfo, member: any = undefined)
    {
        super();
       
        this.manager = manager;
        this.info = info;
        var id = this.info.id;
       
        if (!!member)
        {
            this.member = new GroupMember(this, member);
        }

        logger.log(`Joined ${id} - ${this.info.name}`);
       
        //Must be done internally, as there is no me-group-update
        this.manager.subscriptions.subscribe('group-update', id, this.receiveNewInfo.bind(this));

        this.members = this.createList('members', 'member', true, true, data => new GroupMember(this, data));
        this.invites = this.createList('invites', 'invite', false, false, data => new GroupMemberInvite(this, data));
        this.requests = this.createList('requests', 'request', false, false,  data => new GroupMemberRequest(this, data));
        this.bans = this.createList('bans', 'ban', false, false, data => new GroupMemberBan(this, data));
        
        this.servers = new GroupServerList(this.manager.subscriptions, this);

        this.servers.on('create', data => this.emit('server-create', data));
        this.servers.on('delete', data => this.emit('server-delete', data));
        this.servers.on('update', (item, old) => item.onUpdate(old.info));
    }

    createList<T extends GroupMember>(route: string, name: string, hasSingle:boolean, hasUpdate:boolean, create: (data: any) => T): GroupMemberList<T>
    {
        var id = this.info.id;
        
        var subscribeToCreate = `group-${name}-create`;
        var subscribeToDelete = `group-${name}-delete`;
        var subscribeToUpdate = hasUpdate ? `group-${name}-update` : undefined;
        
        var list: GroupMemberList<T> = new GroupMemberList(this.manager.subscriptions, {
            name: `${this.info.name} ${name}`,
            getAll: `groups/${id}/${route}?limit=1000`, 
            getSingle: hasSingle ? `groups/${id}/${route}` : undefined,
            subscribeToCreate,
            subscribeToDelete,
            subscribeToUpdate,
            getRawId: data => data.user_id,
            getId: item => item.userId,
            process: create
        },
        id);
        
        var createEvent = `${name}-create` as keyof GroupEvents;
        var deleteEvent = `${name}-delete` as keyof GroupEvents;

        list.on('create', data => this.emit(createEvent, data));
        list.on('delete', data => this.emit(deleteEvent, data));
        
        return list;
    }

    hasPermission(permission:Permission|string)
    {
        if (!this.member)
        {
            return false;
        }

        var roleId = this.member.role;

        var role = this.info.roles.find(item => item.role_id == roleId);
        
        if (!role)
        {
            return false;
        }

        return role.permissions.includes(permission.toString());
    }
    
    dispose()
    {
        logger.info(`Left ${this.info.id} - ${this.info.name}`);
    }

    leave()
    {
        return this.manager.api.fetch('DELETE', `groups/${this.info.id}/members`);
    }

    invite(userId:number)
    {
        return this.manager.api.fetch('POST', `groups/${this.info.id}/invites/${userId}`);
    }

    editInfo(edit:any)
    {
        return this.manager.api.fetch('PATCH', `groups/${this.info.id}`, edit);
    }

    private receiveNewInfo(event: any)
    {
        this.manager.groups.receiveUpdate(event);
    }

    updated()
    {
        this.emit('update', this);
    }

    async automaticConsole(callback:(console:ServerConnection)=>void)
    {   
        if (this.isConsoleAutomatic)
        {
            logger.error("Can't enable automatic console twice");
            return;
        }
        
        logger.info(`Enabling automatic console for ${this.info.name}`);

        this.isConsoleAutomatic = true;

        await this.servers.refresh(true);
        await this.servers.refreshStatus(true);

        let connections:ServerConnection[] = [];

        let handleStatus = async (server:Server) =>
        {
            if (this.hasPermission(Permission.Console))
            {
                if (server.isOnline)
                {
                    try
                    {
                        var result = await server.getConsole();

                        if (!connections.includes(result))
                        {
                            connections.push(result);

                            result.on('closed', (connection, info) => connections.splice(connections.indexOf(connection), 1));

                            callback(result);
                        }
                    }
                    catch (e)
                    {
                        console.log("catch");
                        console.error(e);
                        //Permission denied (if not, see console)
                    }
                }
            }
            else
            {
                server.console?.disconnect();
            }
        }

        let checkAll = (group:Group) =>
        {
            console.log("Role changed");

            for (var server of this.servers.items)
            {
                handleStatus(server);
            }
        };

        this.on('update', checkAll);

        this.servers.on('create', server =>
        {
            server.on('status', handleStatus);
            
            handleStatus(server);
        })

        for (var server of this.servers.items)
        {
            server.on('status', handleStatus);

            handleStatus(server);
        }
    }
}
