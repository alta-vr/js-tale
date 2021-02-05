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
exports.Group = exports.GroupServerList = exports.GroupMemberList = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var LiveList_1 = require("../Core/LiveList");
var GroupMember_1 = require("./GroupMember");
var GroupMemberRequest_1 = require("./GroupMemberRequest");
var GroupMemberInvite_1 = require("./GroupMemberInvite");
var GroupMemberBan_1 = require("./GroupMemberBan");
var Server_1 = require("./Server");
var logger_1 = __importDefault(require("../logger"));
var GroupMemberList = /** @class */ (function (_super) {
    __extends(GroupMemberList, _super);
    function GroupMemberList(name, getAll, subscribeToCreate, subscribeToDelete, subscribeToUpdate, process) {
        return _super.call(this, name, getAll, subscribeToCreate, subscribeToDelete, subscribeToUpdate, function (data) { return data.user_id; }, function (item) { return item.userId; }, process) || this;
    }
    GroupMemberList.prototype.find = function (item) {
        if (typeof item == 'string') {
            var parsed = parseInt(item);
            if (!isNaN(parsed)) {
                return _super.prototype.get.call(this, parsed);
            }
            item = item.toLowerCase();
            return this.items.find(function (test) { return test.username.toLowerCase() == item; });
        }
        return _super.prototype.get.call(this, item);
    };
    return GroupMemberList;
}(LiveList_1.LiveList));
exports.GroupMemberList = GroupMemberList;
var GroupServerList = /** @class */ (function (_super) {
    __extends(GroupServerList, _super);
    function GroupServerList(group) {
        var _this = _super.call(this, group.info.name + " servers", function () { return new Promise(function (resolve) { return resolve(group.info.servers); }); }, function (callback) { return group.manager.subscriptions.subscribe('group-server-create', group.info.id, callback); }, function (callback) { return group.manager.subscriptions.subscribe('group-server-update', group.info.id, callback); }, function (callback) { return group.manager.subscriptions.subscribe('group-server-update', group.info.id, callback); }, function (data) { return data.id; }, function (server) { return server.data.id; }, function (data) { return new Server_1.Server(group, data); }) || this;
        _this.isStatusLive = false;
        _this.group = group;
        _this.manager = group.manager;
        return _this;
    }
    GroupServerList.prototype.refreshStatus = function (subscribe) {
        if (subscribe === void 0) { subscribe = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, server;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isStatusLive) {
                            return [2 /*return*/, this.items];
                        }
                        if (subscribe) {
                            this.isStatusLive = true;
                            this.manager.subscriptions.subscribe('group-server-status', this.group.info.id, this.onStatus.bind(this)).then(function () { return logger.log("Subscribed to " + _this.group.info.name + " status"); }).catch(function (error) {
                                logger.error("Error subscribing to status for " + _this.group.info.name);
                                logger.info(error);
                            });
                        }
                        _i = 0, _a = this.items;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        server = _a[_i];
                        return [4 /*yield*/, this.manager.api.fetch('GET', "servers/" + server.data.id)
                                .then(function (data) { return server.onStatus(data); })
                                .then(logger.thenInfo("Refreshed server info for " + server.data.name + " (" + server.data.id + ")"))
                                .catch(function (e) {
                                logger.error("Error getting server info for " + server.data.name);
                                logger.info(e);
                            })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.items];
                }
            });
        });
    };
    GroupServerList.prototype.onStatus = function (data) {
        var server = this.get(data.content.id);
        if (!!server) {
            server.onStatus(data.content);
        }
    };
    return GroupServerList;
}(LiveList_1.LiveList));
exports.GroupServerList = GroupServerList;
var logger = new logger_1.default('Group');
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group(manager, info, member) {
        if (member === void 0) { member = undefined; }
        var _this = _super.call(this) || this;
        _this.isConsoleAutomatic = false;
        _this.manager = manager;
        _this.info = info;
        _this.member = member;
        var id = _this.info.id;
        logger.log("Joined " + id + " - " + _this.info.name);
        //Must be done internally, as there is no me-group-update
        _this.manager.subscriptions.subscribe('group-update', id, _this.receiveNewInfo.bind(_this));
        _this.members = _this.createList('members', 'member', true, function (data) { return new GroupMember_1.GroupMember(_this, data); });
        _this.invites = _this.createList('invites', 'invite', false, function (data) { return new GroupMemberInvite_1.GroupMemberInvite(_this, data); });
        _this.requests = _this.createList('requests', 'request', false, function (data) { return new GroupMemberRequest_1.GroupMemberRequest(_this, data); });
        _this.bans = _this.createList('bans', 'ban', false, function (data) { return new GroupMemberBan_1.GroupMemberBan(_this, data); });
        _this.servers = new GroupServerList(_this);
        _this.servers.on('create', function (data) { return _this.emit('server-create', data); });
        _this.servers.on('delete', function (data) { return _this.emit('server-delete', data); });
        _this.servers.on('update', function (item, old) { return item.onUpdate(old.data); });
        return _this;
    }
    Group.prototype.createList = function (route, name, hasUpdate, create) {
        var _this = this;
        var id = this.info.id;
        var createSub = "group-" + name + "-create";
        var deleteSub = "group-" + name + "-delete";
        var updateSub = "group-" + name + "-update";
        var list = new GroupMemberList(this.info.name + " " + name, function () { return _this.manager.api.fetch('GET', "groups/" + id + "/" + route); }, function (callback) { return _this.manager.subscriptions.subscribe(createSub, id, callback); }, function (callback) { return _this.manager.subscriptions.subscribe(deleteSub, id, callback); }, hasUpdate ? function (callback) { return _this.manager.subscriptions.subscribe(updateSub, id, callback); } : undefined, create);
        var createEvent = name + "-create";
        var deleteEvent = name + "-delete";
        list.on('create', function (data) { return _this.emit(createEvent, data); });
        list.on('delete', function (data) { return _this.emit(deleteEvent, data); });
        return list;
    };
    Group.prototype.dispose = function () {
        logger.info("Left " + this.info.id + " - " + this.info.name);
    };
    Group.prototype.leave = function () {
        return this.manager.api.fetch('DELETE', "groups/" + this.info.id + "/members");
    };
    Group.prototype.invite = function (userId) {
        return this.manager.api.fetch('POST', "groups/" + this.info.id + "/invites/" + userId);
    };
    Group.prototype.receiveNewInfo = function (event) {
        this.manager.groups.receiveUpdate(event);
        this.emit('update', this);
    };
    Group.prototype.automaticConsole = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var connections, handleStatus, _i, _a, server;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isConsoleAutomatic) {
                            logger.error("Can't enable automatic console twice");
                            return [2 /*return*/];
                        }
                        logger.info("Enabling automatic console for " + this.info.name);
                        this.isConsoleAutomatic = true;
                        return [4 /*yield*/, this.servers.refresh(true)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.servers.refreshStatus(true)];
                    case 2:
                        _b.sent();
                        connections = [];
                        handleStatus = function (server) { return __awaiter(_this, void 0, void 0, function () {
                            var result, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        console.info("Received status from " + server.data.name + " - " + server.isOnline + " - " + server.data.online_ping + " - " + server.data.online_players.length);
                                        if (!server.isOnline) return [3 /*break*/, 4];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, server.getConsole()];
                                    case 2:
                                        result = _b.sent();
                                        if (!connections.includes(result)) {
                                            connections.push(result);
                                            result.on('closed', function (connection, data) { return connections.splice(connections.indexOf(connection), 1); });
                                            callback(result);
                                        }
                                        else {
                                            console.info("Console for " + server.data.name + " already exists.");
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        this.servers.on('create', function (server) {
                            server.on('status', handleStatus);
                        });
                        for (_i = 0, _a = this.servers.items; _i < _a.length; _i++) {
                            server = _a[_i];
                            handleStatus(server);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Group;
}(tiny_typed_emitter_1.TypedEmitter));
exports.Group = Group;
