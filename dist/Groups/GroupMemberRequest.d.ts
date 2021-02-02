import { GroupMember } from './GroupMember';
import { Group } from "./Group";
export declare class GroupMemberRequest extends GroupMember {
    constructor(group: Group, info: any);
    accept(): Promise<PromiseLike<never>>;
    reject(): Promise<PromiseLike<never>>;
}
