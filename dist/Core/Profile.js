"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default("Alta Profile");
var Profile = /** @class */ (function () {
    function Profile(api) {
        this.api = api;
    }
    Profile.prototype.refresh = function () {
        logger.warn("Refresh not yet implemented");
        return Promise.resolve();
    };
    Profile.prototype.getLoggedIn = function () {
        return this.api.decodedToken !== undefined;
    };
    Profile.prototype.getId = function () {
        return this.api.decodedToken.sub;
    };
    Profile.prototype.getUsername = function () {
        return this.api.decodedToken.username;
    };
    Profile.prototype.getVerified = function () {
        return this.api.decodedToken.is_verified;
    };
    Profile.prototype.requestVerificationEmail = function (email) {
        if (!this.getVerified()) {
            logger.info("Requesting verification");
            return this.api.fetch("PUT", "users/" + this.getId() + "/verification", { email: email });
        }
    };
    return Profile;
}());
exports.default = Profile;
