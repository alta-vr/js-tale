"use strict";
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
exports.SubscriptionManager = void 0;
var ws_1 = __importDefault(require("ws"));
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var logger_1 = __importDefault(require("../logger"));
var logger = new logger_1.default('SubscriptionManager');
var SubscriptionManager = /** @class */ (function () {
    function SubscriptionManager(api) {
        this.ws = undefined;
        this.nextId = 0;
        this.api = api;
        this.emitter = new tiny_typed_emitter_1.TypedEmitter();
    }
    SubscriptionManager.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.ws = new ws_1.default("wss://5wx2mgoj95.execute-api.ap-southeast-2.amazonaws.com/dev", { headers: _this.api.headers });
                        _this.ws.on('open', function () {
                            resolve();
                        });
                        _this.ws.on('message', function (message) {
                            if (!!message) {
                                try {
                                    var parsed = JSON.parse(message);
                                }
                                catch (e) {
                                    var parsed = message;
                                }
                                try {
                                    _this.onMessage(parsed);
                                }
                                catch (e) {
                                    logger.error(e);
                                    logger.error(parsed);
                                }
                            }
                        });
                        _this.ws.on('close', function (code, reason) {
                            if (code == 1001) {
                                logger.info("Websocket expired, recreating");
                                _this.init();
                            }
                            else {
                                logger.error("WebAPI Websocket closed. Code: " + code + ". Reason: " + reason + ".");
                            }
                        });
                    })];
            });
        });
    };
    SubscriptionManager.prototype.subscribe = function (event, sub, callback) {
        var _this = this;
        if (!this.ws) {
            throw new Error("Subscription manager must have init called first");
        }
        this.nextId++;
        this.emitter.on(event + "-" + sub, callback);
        this.ws.send(JSON.stringify({
            id: this.nextId,
            method: 'POST',
            path: "subscription/" + event + "/" + sub,
            authorization: this.api.headers["Authorization"]
        }));
        return new Promise(function (resolve, reject) { return _this.emitter.once("request-" + _this.nextId, function (data) { data.responseCode == 200 ? resolve(data) : reject(data); }); });
    };
    SubscriptionManager.prototype.onMessage = function (data) {
        if (!!data) {
            if (data.id > 0) {
                this.emitter.emit("request-" + data.id, data);
                return;
            }
            if (!!data.event) {
                data.content = JSON.parse(data.content);
                this.emitter.emit(data.event, data);
                this.emitter.emit(data.event + "-" + data.key, data);
            }
            else {
                this.emitter.emit('message', data);
            }
        }
    };
    return SubscriptionManager;
}());
exports.SubscriptionManager = SubscriptionManager;
