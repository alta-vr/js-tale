"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupInvite');
var GroupInvite = /** @class */ (function () {
    function GroupInvite(manager, info) {
        this.manager = manager;
        this.info = info;
    }
    GroupInvite.prototype.accept = function () {
        return this.manager.api.fetch('POST', "groups/invites/" + this.info.id)
            .then(logger.thenInfo("Accepted invite to " + this.info.name + " (" + this.info.id + ")"));
    };
    GroupInvite.prototype.reject = function () {
        return this.manager.api.fetch('DELETE', "groups/invites/" + this.info.id)
            .then(logger.thenInfo("Rejected invite to " + this.info.name + " (" + this.info.id + ")"));
    };
    return GroupInvite;
}());
exports.GroupInvite = GroupInvite;
