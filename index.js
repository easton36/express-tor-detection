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
var dns = require("dns");
// https://2019.www.torproject.org/projects/tordnsel.html.en
var TOR_DNS_LOOKUP_URL = "dnsel.torproject.org";
// reverse the sections of an ip address
var reverseIp = function (ip) { return ip.split(".").reverse().join("."); };
// lookup the dns record for the target ip
var lookupDns = function (ip) { return new Promise(function (res, rej) {
    var reversedIp = reverseIp(ip);
    //lookup dns
    dns.lookup(reversedIp + "." + TOR_DNS_LOOKUP_URL, function (err, address) {
        if (err) {
            if (err.code === 'ENOTFOUND') {
                return res(false);
            }
            return rej(err);
        }
        // TOR exit nodes return an interal ip address
        if (address.startsWith('127.0.0.')) {
            return res(true);
        }
        return res(false);
    });
}); };
/**
 * Express middlewear to check if the request is from a tor exit node
 * @param {config} config
 * @returns {boolean} true if the request is from a tor exit node
*/
var middlewear = function (config) {
    if (config === void 0) { config = {
        block: false,
        userKey: 'isTor',
        errorFormat: 'json',
        errorMessage: 'You are not allowed to access this resource'
    }; }
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var ip, isTor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    // isolate ipv4 address from prefix
                    if (ip.substring(0, 7) === '::ffff:') {
                        ip = ip.substring(7);
                    }
                    return [4 /*yield*/, lookupDns(ip)];
                case 1:
                    isTor = _a.sent();
                    // if the request is from a tor exit node
                    if (config.block && isTor) {
                        // if the request is a json request
                        if (config.errorFormat === 'json') {
                            return [2 /*return*/, res.status(403).json({
                                    status: config.errorMessage
                                })];
                        }
                        return [2 /*return*/, res.status(403).send(config.errorMessage)];
                    }
                    // add the user key to the request
                    req[config.userKey] = isTor;
                    next();
                    return [2 /*return*/];
            }
        });
    }); };
};
module.exports = middlewear;
