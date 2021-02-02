import { GroupInfo } from './GroupInfo';
import { GroupManager } from "./GroupManager";
export declare class GroupRequest {
    manager: GroupManager;
    info: GroupInfo;
    constructor(manager: GroupManager, info: GroupInfo);
    revoke(): Promise<PromiseLike<never>>;
}
