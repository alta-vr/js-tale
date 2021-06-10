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
        this.groups = new LiveList("groups", 
            () => this.api.fetch('GET', 'groups/joined'), 
            id => this.api.fetch('GET', `groups/${id}`),
            callback => this.subscriptions.subscribe('me-group-create', this.api.userId, callback), 
            callback => this.subscriptions.subscribe('me-group-delete', this.api.userId, callback), 
            undefined,
            data => !!data.group ? data.group.id : data.id, 
            group => group.info.id, 
            data => !!data.group ? new Group(this, data.group, data.member) : new Group(this, data));
            
        this.groups.on('create', group => this.emit('create', group));
        this.groups.on('delete', group =>
        {
            group.dispose();
            this.emit('delete', group);
        });
        
        this.invites = new LiveList("invites", () => this.api.fetch('GET', 'groups/invites'), undefined, callback => this.subscriptions.subscribe('me-group-invite-create', this.api.userId, callback), callback => this.subscriptions.subscribe('me-group-invite-delete', this.api.userId, callback), undefined, data => data.id, invite => invite.info.id, data => new GroupInvite(this, data));
        this.requests = new LiveList("requests", () => this.api.fetch('GET', 'groups/requests'), undefined, callback => this.subscriptions.subscribe('me-group-request-create', this.api.userId, callback), callback => this.subscriptions.subscribe('me-group-request-delete', this.api.userId, callback), undefined, data => data.id, invite => invite.info.id, data => new GroupRequest(this, data));
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
