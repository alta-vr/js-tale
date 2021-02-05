"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRequest = void 0;
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupRequest');
var GroupRequest = /** @class */ (function () {
    function GroupRequest(manager, info) {
        this.manager = manager;
        this.info = info;
    }
    GroupRequest.prototype.revoke = function () {
        return this.manager.api.fetch('DELETE', "groups/requests/" + this.info.id)
            .then(logger.thenInfo("Revoked request to join " + this.info.name + " (" + this.info.id + ")"));
    };
    return GroupRequest;
}());
exports.GroupRequest = GroupRequest;
