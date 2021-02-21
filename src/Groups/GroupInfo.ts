import Server from "./Server";

interface GroupRole
{
    role_id: number;
    name: string;
    color: string;
    permissions: string[];
}

export default interface GroupInfo
{
    id: number;
    name: string;
    description: string;
    member_count: number;
    created_at: Date;
    type: string;
    tags: string[];

    roles: GroupRole[];
    allowed_servers_count: number;
    servers: Server[];
}
