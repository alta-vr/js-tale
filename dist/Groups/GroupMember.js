"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupMember = /** @class */ (function () {
    function GroupMember(group, data) {
        this.group = group;
        this.userId = data.user_id;
        this.username = data.username;
        this.icon = data.icon;
        this.role = data.role_id;
        this.created = data.created_at;
    }
    return GroupMember;
}());
exports.GroupMember = GroupMember;
