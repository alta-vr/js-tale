import { GroupMember } from './GroupMember';
import { Group } from "./Group";
export declare class GroupMemberBan extends GroupMember {
    constructor(group: Group, info: any);
    revoke(): Promise<PromiseLike<never>>;
}
