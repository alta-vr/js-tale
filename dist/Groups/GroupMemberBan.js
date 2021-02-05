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
exports.GroupMemberBan = void 0;
var GroupMember_1 = require("./GroupMember");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupMemberBan');
var GroupMemberBan = /** @class */ (function (_super) {
    __extends(GroupMemberBan, _super);
    function GroupMemberBan(group, info) {
        return _super.call(this, group, info) || this;
    }
    GroupMemberBan.prototype.revoke = function () {
        return this.group.manager.api.fetch('DELETE', "groups/" + this.group.info.id + "/bans/" + this.userId)
            .then(logger.thenInfo("Revoked ban for " + this.userId));
    };
    return GroupMemberBan;
}(GroupMember_1.GroupMember));
exports.GroupMemberBan = GroupMemberBan;
