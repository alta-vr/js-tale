"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var GroupMember_1 = require("./GroupMember");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupMemberRequest');
var GroupMemberRequest = /** @class */ (function (_super) {
    __extends(GroupMemberRequest, _super);
    function GroupMemberRequest(group, info) {
        return _super.call(this, group, info) || this;
    }
    GroupMemberRequest.prototype.accept = function () {
        return this.group.manager.api.fetch('POST', "groups/" + this.group.info.id + "/requests/" + this.userId)
            .then(logger.thenInfo("Accepted " + this.username + " (" + this.userId + ")'s request to join " + this.group.info.name + " (" + this.group.info.id + ")"));
    };
    GroupMemberRequest.prototype.reject = function () {
        return this.group.manager.api.fetch('DELETE', "groups/" + this.group.info.id + "/requests/" + this.userId)
            .then(logger.thenInfo("Rejected " + this.username + " (" + this.userId + ")'s reqyest to join " + this.group.info.name + " (" + this.group.info.id + ")"));
    };
    return GroupMemberRequest;
}(GroupMember_1.GroupMember));
exports.GroupMemberRequest = GroupMemberRequest;
