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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.LiveList = void 0;
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('LiveList');
var LiveList = /** @class */ (function (_super) {
    __extends(LiveList, _super);
    function LiveList(name, getAll, getSingle, subscribeToCreate, subscribeToDelete, subscribeToUpdate, getRawId, getId, process) {
        var _this = _super.call(this) || this;
        _this.items = [];
        _this.isLive = false;
        _this.isBlocked = false;
        _this.map = {};
        _this.name = name;
        _this.getAll = getAll;
        _this.getSingle = getSingle;
        _this.subscribeToCreate = subscribeToCreate;
        _this.subscribeToDelete = subscribeToDelete;
        _this.getRawId = getRawId;
        _this.getId = getId;
        _this.process = process;
        return _this;
    }
    LiveList.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.isLive && !this.map[id] && !!this.getSingle)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getSingle(id)];
                    case 1:
                        item = _a.sent();
                        this.receiveCreate({ content: item });
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.map[id]];
                }
            });
        });
    };
    LiveList.prototype.refresh = function (subscribe) {
        if (subscribe === void 0) { subscribe = false; }
        return __awaiter(this, void 0, void 0, function () {
            var results, e_1, i, item, id, _i, results_1, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isLive || this.isBlocked) {
                            return [2 /*return*/, this.items];
                        }
                        if (subscribe) {
                            this.isLive = true;
                            this.subscribeToCreate(this.receiveCreate.bind(this)).then(function () { return logger.log("Subscribed to " + _this.name + " create"); }).catch(function (error) {
                                if (error.responseCode == 404)
                                    _this.block();
                            });
                            this.subscribeToDelete(this.receiveDelete.bind(this)).then(function () { return logger.log("Subscribed to " + _this.name + " delete"); }).catch(function (error) {
                                if (error.responseCode == 404)
                                    _this.block();
                            });
                            if (!!this.subscribeToUpdate) {
                                this.subscribeToUpdate(this.receiveUpdate.bind(this)).then(function () { return logger.log("Subscribed to " + _this.name + " update"); }).catch(function (error) {
                                    if (error.responseCode == 404)
                                        _this.block();
                                });
                            }
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getAll()];
                    case 2:
                        results = _a.sent();
                        if (results === undefined) {
                            logger.info("getAll returned undefined in " + this.name);
                            results = [];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        logger.error("Error getting items for LiveList");
                        logger.info(e_1);
                        results = [];
                        this.block();
                        return [3 /*break*/, 4];
                    case 4:
                        for (i = 0; i < this.items.length; i++) {
                            item = this.items[i];
                            id = this.getId(item);
                            if (!results.some(function (result) { return _this.getRawId(result) == id; })) {
                                this.items.splice(i, 1);
                                i--;
                                delete this.map[id];
                                this.emit('delete', item);
                            }
                        }
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            this.receiveCreate({ content: result });
                        }
                        return [2 /*return*/, this.items];
                }
            });
        });
    };
    LiveList.prototype.block = function () {
        if (!this.isBlocked) {
            this.isBlocked = true;
            logger.error("Not allowed to access " + this.name);
        }
    };
    LiveList.prototype.receiveCreate = function (event) {
        var _this = this;
        if (!event.content) {
            logger.info(event);
        }
        try {
            var id = this.getRawId(event.content);
        }
        catch (e) {
            logger.error("Error in receive create");
            logger.info(e);
            throw e;
        }
        if (!this.items.some(function (item) { return _this.getId(item) == id; })) {
            var item = this.process(event.content);
            this.items.push(item);
            this.map[id] = item;
            this.emit('create', item);
        }
    };
    LiveList.prototype.receiveDelete = function (event) {
        var _this = this;
        var id = this.getRawId(event.content);
        var index = this.items.findIndex(function (item) { return _this.getId(item) == id; });
        if (index >= 0) {
            var item = this.items.splice(index, 1)[0];
            delete this.map[id];
            this.emit('delete', item);
        }
    };
    LiveList.prototype.receiveUpdate = function (event) {
        var _this = this;
        var id = this.getRawId(event.content);
        var index = this.items.findIndex(function (item) { return _this.getId(item) == id; });
        if (index >= 0) {
            var cache = __assign({}, this.items[index]);
            Object.assign(this.items[index], this.process(event.content));
            this.emit('update', this.items[index], cache);
        }
    };
    return LiveList;
}(tiny_typed_emitter_1.TypedEmitter));
exports.LiveList = LiveList;
