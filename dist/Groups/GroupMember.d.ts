import Group from "./Group";
export default class GroupMember {
    group: Group;
    userId: number;
    username: string;
    icon: number;
    role: number;
    created: Date;
    constructor(group: Group, data: any);
}
