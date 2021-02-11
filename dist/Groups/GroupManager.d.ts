import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { ApiConnection } from '../Core/ApiConnection';
import { GroupRequest } from './GroupRequest';
import { GroupInvite } from './GroupInvite';
import { SubscriptionManager } from "../Core/SubscriptionManager";
import { Group } from "./Group";
import { LiveList } from "../Core/LiveList";
import { ServerConnection } from './ServerConnection';
interface GroupManagerEvents {
    'create': (group: Group) => void;
    'delete': (group: Group) => void;
}
export declare class GroupManager extends EventEmitter<GroupManagerEvents> {
    api: ApiConnection;
    subscriptions: SubscriptionManager;
    groups: LiveList<Group>;
    invites: LiveList<GroupInvite>;
    requests: LiveList<GroupRequest>;
    constructor(subscriptions: SubscriptionManager);
    acceptAllInvites(subscribe: boolean): Promise<void>;
    automaticConsole(callback: (connection: ServerConnection) => void): Promise<void>;
}
export {};
