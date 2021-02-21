import GroupInfo from './GroupInfo';
import GroupManager from "./GroupManager";
import Logger from '../logger';

const logger = new Logger('GroupInvite');

export default class GroupInvite
{
    manager: GroupManager;
    info: GroupInfo;
    constructor(manager: GroupManager, info: GroupInfo)
    {
        this.manager = manager;
        this.info = info;
    }

    accept()
    {
        return this.manager.api.fetch('POST', `groups/invites/${this.info.id}`)
        .then(logger.thenInfo(`Accepted invite to ${this.info.name} (${this.info.id})`));
    }

    reject()
    {
        return this.manager.api.fetch('DELETE', `groups/invites/${this.info.id}`)
        .then(logger.thenInfo(`Rejected invite to ${this.info.name} (${this.info.id})`));
    }
}
