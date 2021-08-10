import Group from "./Group";
import Logger from '../logger';

const logger = new Logger('GroupMember');

export default class GroupMember
{
    group: Group;
    userId: number;
    username: string;
    icon: number;
    role: number;
    created: Date;
    type: string;
    bot:boolean;

    constructor(group: Group, data: any)
    {
        this.group = group;
        this.userId = data.user_id;
        this.username = data.username;
        this.icon = data.icon;
        this.role = data.role_id;
        this.created = data.created_at;
        this.type = data.type;
        this.bot = data.bot;
    }

    ban()
    {
        return this.group.manager.api.fetch('POST', `groups/${this.group.info.id}/bans/${this.userId}`)
        .then(logger.thenInfo(`Banned ${this.userId}`));
    }
}
