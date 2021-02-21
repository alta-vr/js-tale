import GroupMember from './GroupMember';
import Group from "./Group";
export default class GroupMemberInvite extends GroupMember {
    constructor(group: Group, info: any);
    revoke(): Promise<PromiseLike<never>>;
}
