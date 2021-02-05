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
exports.Console = void 0;
var att_websockets_1 = require("att-websockets");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var logger_1 = __importDefault(require("../logger"));
var events_1 = require("events");
var logger = new logger_1.default('Console');
var Console = /** @class */ (function (_super) {
    __extends(Console, _super);
    function Console(server) {
        var _this = _super.call(this) || this;
        _this.internalEmitter = new events_1.EventEmitter();
        _this.server = server;
        _this.connection = new att_websockets_1.Connection(_this.server.data.name);
        _this.connection.onMessage = _this.handleMessage.bind(_this);
        _this.connection.onError = _this.handleError.bind(_this);
        _this.connection.onClose = _this.handleClose.bind(_this);
        return _this;
    }
    Console.prototype.reattempt = function () {
        if (this.isAllowed === false) {
            this.isAllowed = undefined;
            return this.waitReady();
        }
    };
    Console.prototype.waitReady = function () {
        var _this = this;
        if (this.initializing === undefined) {
            this.initializing = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.server.group.manager.api.fetch('POST', "servers/" + this.server.data.id + "/console", {})
                        .then(function (details) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!details.allowed) return [3 /*break*/, 2];
                                    logger.success("Connecting to " + this.server.data.name);
                                    return [4 /*yield*/, this.connection.connect(details.connection.address, details.connection.websocket_port, details.token)];
                                case 1:
                                    _a.sent();
                                    this.isAllowed = true;
                                    resolve();
                                    return [3 /*break*/, 3];
                                case 2:
                                    this.isAllowed = false;
                                    reject();
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (e) {
                        console.log(e);
                        if (e.code != 403) {
                            logger.error("Unexpected error connecting to server");
                            logger.info(e);
                        }
                        reject();
                    });
                    return [2 /*return*/];
                });
            }); });
        }
        return this.initializing;
    };
    Console.prototype.handleMessage = function (data) {
        switch (data.type) {
            case att_websockets_1.MessageType.SystemMessage:
                this.emit('system', this, data);
                break;
            case att_websockets_1.MessageType.Subscription:
                this.internalEmitter.emit('SUB' + data.eventType, data.data);
                break;
            case att_websockets_1.MessageType.CommandResult:
                this.internalEmitter.emit('CR' + data.commandId, data.data);
                break;
            default:
                logger.warn("Unhandled message:");
                logger.info(data);
                break;
        }
    };
    Console.prototype.handleError = function (data) {
        logger.error("Connection threw an error");
        logger.info(data);
        this.emit('error', this, data);
    };
    Console.prototype.handleClose = function (data) {
        logger.info("Connection closed");
        logger.info(data);
        this.emit('closed', this, data);
    };
    Console.prototype.send = function (command) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = _this.connection.send(command);
            _this.internalEmitter.once('CR' + id, resolve);
        });
    };
    Console.prototype.subscribe = function (event, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.log("Subscribing to " + event);
                        this.internalEmitter.addListener('SUB' + event, callback);
                        return [4 /*yield*/, this.send('websocket subscribe ' + event)];
                    case 1:
                        result = _a.sent();
                        if (!!result.Exception) {
                            logger.error("Failed to subscribe to " + event);
                            logger.info(result.Exception);
                        }
                        else {
                            logger.log("Subscribed to " + event + " : " + result.ResultString);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Console.prototype.unsubscribe = function (event, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger.log("Unsubscribing from " + event);
                        this.internalEmitter.removeListener('SUB' + event, callback);
                        return [4 /*yield*/, this.send('websocket unsubscribe ' + event)];
                    case 1:
                        result = _a.sent();
                        if (!!result.Exception) {
                            logger.error("Failed to unsubscribe from " + event);
                            logger.info(result.Exception);
                        }
                        else {
                            logger.log("Unsubscribed from " + event + " : " + result.ResultString);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Console.prototype.disconnect = function () {
        this.connection.terminate();
    };
    return Console;
}(tiny_typed_emitter_1.TypedEmitter));
exports.Console = Console;
