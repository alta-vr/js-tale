import GroupInfo from './GroupInfo';
import GroupManager from "./GroupManager";
import Logger from '../logger';

const logger = new Logger('GroupRequest');

export default class GroupRequest
{
    manager: GroupManager;
    info: GroupInfo;

    constructor(manager: GroupManager, info: GroupInfo)
    {
        this.manager = manager;
        this.info = info;
    }

    revoke()
    {
        return this.manager.api.fetch('DELETE', `groups/requests/${this.info.id}`)
        .then(logger.thenInfo(`Revoked request to join ${this.info.name} (${this.info.id})`));
    }
}
