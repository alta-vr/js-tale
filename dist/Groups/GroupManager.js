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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupManager = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var GroupRequest_1 = require("./GroupRequest");
var GroupInvite_1 = require("./GroupInvite");
var Group_1 = require("./Group");
var LiveList_1 = require("../Core/LiveList");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('GroupManager');
var GroupManager = /** @class */ (function (_super) {
    __extends(GroupManager, _super);
    function GroupManager(subscriptions) {
        var _this = _super.call(this) || this;
        _this.api = subscriptions.api;
        _this.subscriptions = subscriptions;
        _this.groups = new LiveList_1.LiveList("groups", function () { return _this.api.fetch('GET', 'groups/joined'); }, function (id) { return _this.api.fetch('GET', "groups/" + id); }, function (callback) { return _this.subscriptions.subscribe('me-group-create', _this.api.userId, callback); }, function (callback) { return _this.subscriptions.subscribe('me-group-delete', _this.api.userId, callback); }, undefined, function (data) { return !!data.group ? data.group.id : data.id; }, function (group) { return group.info.id; }, function (data) { return !!data.group ? new Group_1.Group(_this, data.group, data.member) : new Group_1.Group(_this, data); });
        _this.groups.on('create', function (group) { return _this.emit('create', group); });
        _this.groups.on('delete', function (group) {
            group.dispose();
            _this.emit('delete', group);
        });
        _this.invites = new LiveList_1.LiveList("invites", function () { return _this.api.fetch('GET', 'groups/invites'); }, undefined, function (callback) { return _this.subscriptions.subscribe('me-group-invite-create', _this.api.userId, callback); }, function (callback) { return _this.subscriptions.subscribe('me-group-invite-delete', _this.api.userId, callback); }, undefined, function (data) { return data.id; }, function (invite) { return invite.info.id; }, function (data) { return new GroupInvite_1.GroupInvite(_this, data); });
        _this.requests = new LiveList_1.LiveList("requests", function () { return _this.api.fetch('GET', 'groups/requests'); }, undefined, function (callback) { return _this.subscriptions.subscribe('me-group-request-create', _this.api.userId, callback); }, function (callback) { return _this.subscriptions.subscribe('me-group-request-delete', _this.api.userId, callback); }, undefined, function (data) { return data.id; }, function (invite) { return invite.info.id; }, function (data) { return new GroupRequest_1.GroupRequest(_this, data); });
        return _this;
    }
    GroupManager.prototype.acceptAllInvites = function (subscribe) {
        return __awaiter(this, void 0, void 0, function () {
            var accept, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        accept = function (item) { return item.accept(); };
                        this.invites.on('create', accept);
                        return [4 /*yield*/, this.invites.refresh(subscribe)];
                    case 1:
                        _a.sent();
                        if (!subscribe) {
                            this.invites.removeListener('create', accept);
                        }
                        logger.info("Accepted all group invites");
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        logger.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GroupManager.prototype.automaticConsole = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var handleGroup, _i, _a, group;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger.info("Enabling automatic console for all groups");
                        handleGroup = function (group) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, group.automaticConsole(callback)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        this.on('create', handleGroup);
                        _i = 0, _a = this.groups.items;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        group = _a[_i];
                        return [4 /*yield*/, handleGroup(group)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GroupManager;
}(tiny_typed_emitter_1.TypedEmitter));
exports.GroupManager = GroupManager;
