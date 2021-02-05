"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMemberInvite = void 0;
var GroupMember_1 = require("./GroupMember");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupMemberInvite');
var GroupMemberInvite = /** @class */ (function (_super) {
    __extends(GroupMemberInvite, _super);
    function GroupMemberInvite(group, info) {
        return _super.call(this, group, info) || this;
    }
    GroupMemberInvite.prototype.revoke = function () {
        return this.group.manager.api.fetch('DELETE', "groups/" + this.group.info.id + "/invites/" + this.userId)
            .then(logger.thenInfo("Revoked " + this.username + " (" + this.userId + ")'s invite to " + this.group.info.name + " (" + this.group.info.id + ")"));
    };
    return GroupMemberInvite;
}(GroupMember_1.GroupMember));
exports.GroupMemberInvite = GroupMemberInvite;
