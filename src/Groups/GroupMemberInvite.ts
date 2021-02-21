import GroupMember from './GroupMember';
import Group from "./Group";
import Logger from '../logger';

const logger = new Logger('GroupMemberInvite');

export default class GroupMemberInvite extends GroupMember
{
    constructor(group: Group, info: any)
    {
        super(group, info);
    }
    
    revoke()
    {
        return this.group.manager.api.fetch('DELETE', `groups/${this.group.info.id}/invites/${this.userId}`)
        .then(logger.thenInfo(`Revoked ${this.username} (${this.userId})'s invite to ${this.group.info.name} (${this.group.info.id})`));

    }
}
