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
exports.HttpError = void 0;
var simple_oauth2_1 = require("simple-oauth2");
var jwt_decode_1 = __importDefault(require("jwt-decode"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var logger_1 = __importDefault(require("../logger"));
var sha512_1 = __importDefault(require("crypto-js/sha512"));
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
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
var ApiConnection = /** @class */ (function (_super) {
    __extends(ApiConnection, _super);
    function ApiConnection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.canRefresh = false;
        return _this;
    }
    ApiConnection.prototype.initOffline = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.init(config);
                        return [4 /*yield*/, this.setupHttpsClient()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.init = function (config) {
        this.config = config;
        this.endpoint = config.endpoint || 'https://967phuchye.execute-api.ap-southeast-2.amazonaws.com/test/api/';
        this.clientConfig = {
            client: {
                id: config.client_id,
                secret: config.client_secret,
            },
            auth: {
                tokenHost: config.tokenHost || "https://accounts.townshiptale.com",
                tokenPath: "/connect/token",
                authorizePath: "/connect/authorize"
            }
        };
    };
    ApiConnection.prototype.login = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenParams, client, _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.init(config);
                        if (this.clientConfig == undefined) {
                            logger.error("Invalid client config");
                            return [2 /*return*/];
                        }
                        tokenParams = {
                            scope: config.scope
                        };
                        client = new simple_oauth2_1.ClientCredentials(this.clientConfig);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, client.getToken(tokenParams)];
                    case 2:
                        _a.accessToken = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        this.handleException(e_1);
                        throw e_1;
                    case 4: return [4 /*yield*/, this.setupHttpsClient()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.loginResourceOwner = function (username, password, isHashed) {
        if (isHashed === void 0) { isHashed = false; }
        return __awaiter(this, void 0, void 0, function () {
            var tokenParams, client, _a, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.clientConfig == undefined) {
                            logger.error("Requires initOffline first");
                            return [2 /*return*/];
                        }
                        if (!isHashed) {
                            password = this.hashPassword(password);
                        }
                        this.canRefresh = true;
                        tokenParams = {
                            username: username,
                            password: password,
                            scope: this.config.scope
                        };
                        client = new simple_oauth2_1.ResourceOwnerPassword(this.clientConfig);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, client.getToken(tokenParams)];
                    case 2:
                        _a.accessToken = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        this.handleException(e_2);
                        throw e_2;
                    case 4: return [4 /*yield*/, this.setupHttpsClient()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.handleException = function (e) {
        logger.fatal("Error getting access token");
        if (!!e.data && !!e.data.payload && e.data.isResponseError) {
            throw new Error(e.data.payload.error_description);
        }
        else if (!!e.output && !!e.output.payload) {
            throw e.output.payload;
        }
    };
    ApiConnection.prototype.hashPassword = function (password) {
        return sha512_1.default(password).toString();
    };
    ApiConnection.prototype.loadResourceOwner = function (config, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                this.init(config);
                if (this.clientConfig == undefined) {
                    logger.error("Invalid client config");
                    return [2 /*return*/];
                }
                this.canRefresh = true;
                client = new simple_oauth2_1.ResourceOwnerPassword(this.clientConfig);
                this.accessToken = client.createToken(accessToken);
                this.setupHttpsClient();
                return [2 /*return*/];
            });
        });
    };
    ApiConnection.prototype.setupHttpsClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var decoded;
            return __generator(this, function (_a) {
                logger.info("Setting up https client");
                if (this.accessToken != undefined) {
                    logger.info("Deconding token");
                    this.decodedToken = this.decodedToken || {};
                    decoded = jwt_decode_1.default(this.accessToken.token.access_token);
                    Object.assign(this.decodedToken, decoded);
                }
                this.headers = {
                    "Content-Type": "application/json",
                    "x-api-key": "2l6aQGoNes8EHb94qMhqQ5m2iaiOM9666oDTPORf",
                    "User-Agent": !!this.config ? this.config.client_id : 'Unknown',
                    "Authorization": !!this.accessToken ? ("Bearer " + this.accessToken.token.access_token) : undefined,
                };
                if (!this.httpsAgent) {
                    this.httpsAgent = this.endpoint.startsWith('https') ? new https_1.default.Agent() : new http_1.default.Agent();
                }
                if (!this.userId && !!this.decodedToken) {
                    this.userId = this.decodedToken.client_sub || this.decodedToken.sub;
                    logger.success("User ID: " + this.userId);
                    if (!!this.decodedToken.client_username) {
                        logger.success("Username: " + this.decodedToken.client_username);
                    }
                    this.emit('logged-in');
                }
                this.emit('updated');
                return [2 /*return*/];
            });
        });
    };
    ApiConnection.prototype.checkRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.accessToken == undefined) {
                            return [2 /*return*/];
                        }
                        if (!this.refresh && this.accessToken.expired(15)) {
                            this.refresh = this.refreshInternal();
                        }
                        return [4 /*yield*/, this.refresh];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.refreshInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refreshParams, result, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.config === undefined || this.accessToken === undefined) {
                            return [2 /*return*/];
                        }
                        logger.info("Refreshing session");
                        refreshParams = {
                            scope: this.config.scope
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        if (!this.canRefresh) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.accessToken.refresh(refreshParams)];
                    case 2:
                        result = _a.sent();
                        if (this.accessToken !== undefined) {
                            this.accessToken = result;
                        }
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.login(this.config)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.setupHttpsClient()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_3 = _a.sent();
                        logger.error("Error refreshing token " + e_3.message);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ApiConnection.prototype.fetch = function (method, path, body) {
        if (body === void 0) { body = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkRefresh()];
                    case 1:
                        _a.sent();
                        logger.info("HEADERS");
                        logger.info(this.headers);
                        return [4 /*yield*/, node_fetch_1.default(this.endpoint + path, {
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
                    case 2: return [2 /*return*/, _a.sent()];
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
    ApiConnection.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.accessToken !== undefined) {
                    this.accessToken.revokeAll();
                    this.accessToken = undefined;
                    this.canRefresh = false;
                    this.decodedToken = undefined;
                    this.headers = undefined;
                    this.httpsAgent = undefined;
                    this.config = undefined;
                    this.clientConfig = undefined;
                    this.endpoint = undefined;
                    this.emit('logged-out');
                }
                return [2 /*return*/];
            });
        });
    };
    return ApiConnection;
}(tiny_typed_emitter_1.TypedEmitter));
exports.default = ApiConnection;
