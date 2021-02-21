import Group from "./Group";

export default class GroupMember
{
    group: Group;
    userId: number;
    username: string;
    icon: number;
    role: number;
    created: Date;

    constructor(group: Group, data: any)
    {
        this.group = group;
        this.userId = data.user_id;
        this.username = data.username;
        this.icon = data.icon;
        this.role = data.role_id;
        this.created = data.created_at;
    }
}
