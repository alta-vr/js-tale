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
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var logger_1 = __importDefault(require("../logger"));
var ServerConnection_1 = __importDefault(require("./ServerConnection"));
var logger = new logger_1.default('Server');
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server(group, info) {
        var _this = _super.call(this) || this;
        _this.isOnline = false;
        _this.console = undefined;
        _this.group = group;
        _this.info = info;
        _this.evaluateState();
        return _this;
    }
    Server.prototype.evaluateState = function () {
        this.isOnline = !!this.info.online_ping && Date.now() - Date.parse(this.info.online_ping) < 10 * 60 * 1000;
    };
    //Provided by LiveList update
    Server.prototype.onUpdate = function (oldInfo) {
        this.evaluateState();
        this.emit('update', this, oldInfo);
    };
    Server.prototype.onStatus = function (info) {
        var cache = __assign({}, this.info);
        Object.assign(this.info, info);
        this.evaluateState();
        logger.info(this.info.name + " received status. Online: " + this.isOnline + ". Players: " + (!this.info.online_players ? 0 : this.info.online_players.length));
        this.emit('status', this, cache);
    };
    Server.prototype.getConsole = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.console === undefined) {
                            this.console = new ServerConnection_1.default(this);
                            this.console.on('closed', this.consoleDisconnect.bind(this));
                        }
                        return [4 /*yield*/, this.console.waitReady()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.console];
                }
            });
        });
    };
    Server.prototype.consoleDisconnect = function () {
        logger.error("Console to " + this.info.name + " disconnected.");
        this.console = undefined;
    };
    return Server;
}(tiny_typed_emitter_1.TypedEmitter));
exports.default = Server;
