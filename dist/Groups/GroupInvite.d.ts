import GroupInfo from './GroupInfo';
import GroupManager from "./GroupManager";
export default class GroupInvite {
    manager: GroupManager;
    info: GroupInfo;
    constructor(manager: GroupManager, info: GroupInfo);
    accept(): Promise<PromiseLike<never>>;
    reject(): Promise<PromiseLike<never>>;
}
