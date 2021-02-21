import GroupMember from './GroupMember';
import Group from "./Group";
import Logger from '../logger';

const logger = new Logger('GroupMemberBan');


export default class GroupMemberBan extends GroupMember
{
    constructor(group: Group, info: any)
    {
        super(group, info);
    }
    
    revoke()
    {
        return this.group.manager.api.fetch('DELETE', `groups/${this.group.info.id}/bans/${this.userId}`)
        .then(logger.thenInfo(`Revoked ban for ${this.userId}`));
    }
}