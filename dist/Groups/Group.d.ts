import { TypedEmitter as EventEmitter } from 'tiny-typed-emitter';
import { GroupInfo } from './GroupInfo';
import { GroupManager } from './GroupManager';
import { LiveList } from '../Core/LiveList';
import { GroupMember } from './GroupMember';
import { GroupMemberRequest } from './GroupMemberRequest';
import { GroupMemberInvite } from './GroupMemberInvite';
import { GroupMemberBan } from './GroupMemberBan';
import { Server } from './Server';
import { ServerConnection } from "./ServerConnection";
interface GroupEvents {
    'member-create': (invite: GroupMember) => void;
    'member-delete': (invite: GroupMember) => void;
    'invite-create': (invite: GroupMember) => void;
    'invite-delete': (invite: GroupMember) => void;
    'ban-create': (invite: GroupMember) => void;
    'ban-delete': (invite: GroupMember) => void;
    'request-create': (invite: GroupMember) => void;
    'request-delete': (invite: GroupMember) => void;
    'server-create': (invite: Server) => void;
    'server-delete': (invite: Server) => void;
    'update': (info: Group) => void;
}
export declare class GroupMemberList<T extends GroupMember> extends LiveList<T> {
    constructor(name: string, getAll: () => Promise<any[]>, subscribeToCreate: (callback: (data: any) => void) => Promise<any>, subscribeToDelete: (callback: (data: any) => void) => Promise<any>, subscribeToUpdate: undefined | ((callback: (data: any) => void) => Promise<any>), process: (data: any) => T);
    find(item: number | string): T | undefined;
}
export declare class GroupServerList extends LiveList<Server> {
    group: Group;
    manager: GroupManager;
    isStatusLive: boolean;
    constructor(group: Group);
    refreshStatus(subscribe?: boolean): Promise<Server[]>;
    onStatus(data: any): void;
}
export declare class Group extends EventEmitter<GroupEvents> {
    manager: GroupManager;
    info: GroupInfo;
    member: any;
    invites: GroupMemberList<GroupMemberInvite>;
    members: GroupMemberList<GroupMember>;
    bans: GroupMemberList<GroupMemberBan>;
    requests: GroupMemberList<GroupMemberRequest>;
    servers: GroupServerList;
    private isConsoleAutomatic;
    constructor(manager: GroupManager, info: GroupInfo, member?: any | undefined);
    createList<T extends GroupMember>(route: string, name: string, hasUpdate: boolean, create: (data: any) => T): GroupMemberList<T>;
    dispose(): void;
    leave(): Promise<any>;
    invite(userId: number): Promise<any>;
    private receiveNewInfo;
    automaticConsole(callback: (console: ServerConnection) => void): Promise<void>;
}
export {};
