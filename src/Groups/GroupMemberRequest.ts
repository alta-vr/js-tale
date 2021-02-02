import { GroupMember } from './GroupMember';
import { Group } from "./Group";
import Logger from '../logger';

const logger = new Logger('GroupMemberRequest');

export class GroupMemberRequest extends GroupMember
{
    constructor(group: Group, info: any)
    {
        super(group, info);
    }

    accept()
    {
        return this.group.manager.api.fetch('POST', `groups/${this.group.info.id}/requests/${this.userId}`)
        .then(logger.thenInfo(`Accepted ${this.username} (${this.userId})'s request to join ${this.group.info.name} (${this.group.info.id})`));

    }

    reject()
    {
        return this.group.manager.api.fetch('DELETE', `groups/${this.group.info.id}/requests/${this.userId}`)
        .then(logger.thenInfo(`Rejected ${this.username} (${this.userId})'s reqyest to join ${this.group.info.name} (${this.group.info.id})`));
    }
}
