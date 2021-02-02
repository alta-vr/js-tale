import { GroupInfo } from './GroupInfo';
import { GroupManager } from "./GroupManager";
export declare class GroupInvite {
    manager: GroupManager;
    info: GroupInfo;
    constructor(manager: GroupManager, info: GroupInfo);
    accept(): Promise<PromiseLike<never>>;
    reject(): Promise<PromiseLike<never>>;
}
