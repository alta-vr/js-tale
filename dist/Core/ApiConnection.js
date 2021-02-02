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
var simple_oauth2_1 = require("simple-oauth2");
var jwt_decode_1 = __importDefault(require("jwt-decode"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var logger_1 = __importDefault(require("../logger"));
var HttpError = /** @class */ (function () {
    function HttpError(method, path, code, message) {
        this.method = method;
        this.path = path;
        this.code = code;
        this.message = message;
    }
    return HttpError;
}());
exports.HttpError = HttpError;
var logger = new logger_1.default('ApiConnection');
var ApiConnection = /** @class */ (function () {
    function ApiConnection() {
    }
    ApiConnection.prototype.login = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var clientConfig, tokenParams, client, _a, token;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        clientConfig = {
                            client: {
                                id: config.client_id,
                                secret: config.client_secret
                            },
                            auth: {
                                tokenHost: "https://accounts.townshiptale.com",
                                tokenPath: "/connect/token"
                            }
                        };
                        this.endpoint = config.endpoint || 'https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/test/api/';
                        tokenParams = {
                            scope: config.scope
                        };
                        client = new simple_oauth2_1.ClientCredentials(clientConfig);
                        _a = this;
                        return [4 /*yield*/, client.getToken(tokenParams)];
                    case 1:
                        _a.accessToken = (_b.sent()).token.access_token;
                        this.headers = {
                            "Content-Type": "application/json",
                            "x-api-key": "2l6aQGoNes8EHb94qMhqQ5m2iaiOM9666oDTPORf",
                            "User-Agent": config.client_id,
                            "Authorization": "Bearer " + this.accessToken,
                        };
                        this.httpsAgent = this.endpoint.startsWith('https') ? new https_1.default.Agent() : new http_1.default.Agent();
                        token = jwt_decode_1.default(this.accessToken);
                        this.userId = token.client_sub;
                        logger.success("User ID: " + this.userId);
                        logger.success("Username: " + token.client_username);
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.fetch = function (method, path, body) {
        if (body === void 0) { body = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, node_fetch_1.default(this.endpoint + path, {
                            headers: this.headers,
                            method: method,
                            agent: this.httpsAgent,
                            body: JSON.stringify(body)
                        }).then(function (res) {
                            if (res.ok) {
                                return res;
                            }
                            throw new HttpError(method, path, res.status, res.statusText);
                        })
                            .then(function (res) {
                            return res.json();
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiConnection.prototype.resolveUsernameOrId = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof value == 'string')) return [3 /*break*/, 2];
                        parsed = parseInt(value);
                        if (!isNaN(parsed)) {
                            return [2 /*return*/, parsed];
                        }
                        return [4 /*yield*/, this.fetch("POST", "users/search/username", { username: value }).then(function (result) { return result.id; })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, value];
                }
            });
        });
    };
    return ApiConnection;
}());
exports.ApiConnection = ApiConnection;
