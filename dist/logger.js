"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = void 0;
var chalk_1 = __importDefault(require("chalk"));
var cacheLog = console.log;
var cacheInfo = console.info;
var cacheWarn = console.warn;
var cacheError = console.error;
function initLogger() {
    console = __assign(__assign({}, console), new Logger(undefined, 0));
}
exports.initLogger = initLogger;
var Logger = /** @class */ (function () {
    function Logger(type, minLevel) {
        if (minLevel === void 0) { minLevel = 1; }
        if (!!type) {
            this.tag = "[" + type + "] ";
        }
        else {
            this.tag = '';
        }
        if (Logger.levels[this.tag] === undefined) {
            Logger.levels[this.tag] = minLevel;
        }
    }
    Logger.prototype.formatLog = function (value) {
        if (value instanceof Object) {
            value.logger = this.tag;
            value.timestamp = Date.now();
        }
        else {
            value = new Date().toLocaleString() + ' - ' + this.tag + value;
        }
        return value;
    };
    Logger.prototype.thenTrace = function (message) {
        var _this = this;
        return function (value) { _this.trace(message); return value; };
    };
    Logger.prototype.trace = function (value) {
        if (Logger.levels[this.tag] <= 0) {
            value = this.formatLog(value);
            cacheLog(chalk_1.default.gray(value));
        }
    };
    Logger.prototype.thenLog = function (message) {
        var _this = this;
        return function (value) { _this.log(message); return value; };
    };
    Logger.prototype.log = function (value) {
        if (Logger.levels[this.tag] <= 1) {
            value = this.formatLog(value);
            cacheLog(chalk_1.default.gray(value));
        }
    };
    Logger.prototype.thenInfo = function (message) {
        var _this = this;
        return function (value) { _this.info(message); return value; };
    };
    Logger.prototype.info = function (value) {
        if (Logger.levels[this.tag] <= 2) {
            value = this.formatLog(value);
            cacheInfo(value);
        }
    };
    Logger.prototype.thenSuccess = function (message) {
        var _this = this;
        return function (value) { _this.success(message); return value; };
    };
    Logger.prototype.success = function (value) {
        if (Logger.levels[this.tag] <= 3) {
            value = this.formatLog(value);
            cacheInfo(chalk_1.default.bold.green(value));
        }
    };
    Logger.prototype.thenWarn = function (message) {
        var _this = this;
        return function (value) { _this.warn(message); return value; };
    };
    Logger.prototype.warn = function (value) {
        if (Logger.levels[this.tag] <= 3) {
            value = this.formatLog(value);
            cacheWarn(chalk_1.default.yellow(value));
        }
    };
    Logger.prototype.thenError = function (message) {
        var _this = this;
        return function (value) { _this.error(message); return value; };
    };
    Logger.prototype.error = function (value) {
        if (Logger.levels[this.tag] <= 4) {
            value = this.formatLog(value);
            cacheError(chalk_1.default.bold.red(value));
        }
    };
    Logger.prototype.thenFatal = function (message) {
        var _this = this;
        return function (value) { _this.fatal(message); return value; };
    };
    Logger.prototype.fatal = function (value) {
        value = this.formatLog(value);
        cacheError(chalk_1.default.bold.bgRed(value));
    };
    Logger.levels = {};
    return Logger;
}());
exports.default = Logger;
