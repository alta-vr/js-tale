import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import ApiConnection from '../Core/ApiConnection';
import GroupRequest from './GroupRequest';
import GroupInvite from './GroupInvite';
import SubscriptionManager from "../Core/SubscriptionManager";
import Group from "./Group";
import LiveList from "../Core/LiveList";
import Logger from '../logger';
import ServerConnection from './ServerConnection';


interface GroupManagerEvents
{
    'create': (group: Group) => void,
    'delete': (group: Group) => void,
}

const logger = new Logger('GroupManager');

export default class GroupManager extends EventEmitter<GroupManagerEvents> 
{
    api: ApiConnection;
    subscriptions: SubscriptionManager;
    groups: LiveList<Group>;
    invites: LiveList<GroupInvite>;
    requests: LiveList<GroupRequest>;

    constructor(subscriptions: SubscriptionManager)
    {
        super();
        this.api = subscriptions.api;
        this.subscriptions = subscriptions;
        this.groups = new LiveList(this.subscriptions, {
            name: "groups",
            getAll: 'groups/joined?limit=1000',
            getSingle: this.getGroup.bind(this),
            subscribeToCreate: 'me-group-create',
            subscribeToDelete: 'me-group-delete',
            getRawId : data => !!data.group ? data.group.id : data.id, 
            getId: group => group.info.id, 
            process: data => !!data.group ? new Group(this, data.group, data.member) : new Group(this, data)
        },
        () => this.api.sessionManager.userInfo!.id);

        this.groups.markExpandable();
            
        this.groups.on('create', group => this.emit('create', group));
        this.groups.on('delete', group =>
        {
            group.dispose();
            this.emit('delete', group);
        });
        
        this.invites = new LiveList(this.subscriptions, {
            name: "invites", 
            getAll: 'groups/invites?limit=1000',
            subscribeToCreate: 'me-group-invite-create',
            subscribeToDelete: 'me-group-invite-delete',
            getRawId: data => data.id,
            getId: invite => invite.info.id,
            process: data => new GroupInvite(this, data)
        },
        () => this.api.sessionManager.userInfo!.id);

        this.requests = new LiveList(this.subscriptions, {
            name: "requests",
            getAll: 'groups/requests?limit=1000',
            subscribeToCreate: 'me-group-request-create', 
            subscribeToDelete: 'me-group-request-delete',
            getRawId: data => data.id, 
            getId: invite => invite.info.id,
            process: data => new GroupRequest(this, data)
        },
        () => this.api.sessionManager.userInfo!.id);    
    }   

    private async getGroup(id:number)
    {
        var [group, member] = await Promise.all(
        [
            this.api.fetch('GET', `groups/${id}`),
            this.api.fetch('GET', `groups/${id}/members/${this.api.sessionManager.userInfo!.id}`)       
        ]);

        return { group, member };
    }

    join(id:number)
    {
        return this.api.fetch('POST', `groups/${id}/requests`);
    }

    async acceptAllInvites(subscribe: boolean)
    {
        try
        {
            var accept = (item: GroupInvite) => item.accept();
            
            this.invites.on('create', accept);

            await this.invites.refresh(subscribe);
            
            if (!subscribe)
            {
                this.invites.removeListener('create', accept);
            }

            logger.info("Accepted all group invites");
        }
        catch (e)
        {
            logger.error(e);
        }
    }

    async automaticConsole(callback:(connection:ServerConnection)=>void)
    {
        logger.info("Enabling automatic console for all groups");

        let handleGroup = async (group:Group) =>
        {
            await group.automaticConsole(callback);
        }

        this.on('create', handleGroup);

        for (var group of this.groups.items)
        {
            await handleGroup(group);
        }
    }
}
