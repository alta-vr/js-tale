import { GroupMember } from './GroupMember';
import { Group } from "./Group";
export declare class GroupMemberInvite extends GroupMember {
    constructor(group: Group, info: any);
    revoke(): Promise<PromiseLike<never>>;
}
