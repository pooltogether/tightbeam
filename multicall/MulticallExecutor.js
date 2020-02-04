'use strict';

var _tslib = require('../_virtual/_tslib');

var MULTICALL_ADDRESS_MAINNET = "0xeefba1e63905ef1d7acba5a8513c70307c1ce441";
var MULTICALL_ADDRESS_KOVAN = "0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a";
var MULTICALL_ADDRESS_RINKEBY = "0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821";
var MULTICALL_ADDRESS_GOERLI = "0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e";
var AGGREGATE_SELECTOR = '0x252dba42';
var MulticallExecutor = /** @class */ (function () {
    function MulticallExecutor(providerSource) {
        this.providerSource = providerSource;
    }
    MulticallExecutor.prototype.execute = function (data) {
        return _tslib.__awaiter(this, void 0, void 0, function () {
            var address, callData, tx, provider, result;
            return _tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.multicallAddressOrThrow()];
                    case 1:
                        address = _a.sent();
                        callData = AGGREGATE_SELECTOR + data.substr(2);
                        tx = {
                            to: address,
                            data: callData
                        };
                        return [4 /*yield*/, this.providerSource()];
                    case 2:
                        provider = _a.sent();
                        return [4 /*yield*/, provider.call(tx)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    MulticallExecutor.prototype.multicallAddressOrThrow = function () {
        return _tslib.__awaiter(this, void 0, void 0, function () {
            var provider, network, address, msg;
            return _tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.providerSource()];
                    case 1:
                        provider = _a.sent();
                        return [4 /*yield*/, provider.getNetwork()];
                    case 2:
                        network = _a.sent();
                        address = this.multicallAddress(network.chainId);
                        if (address === null) {
                            msg = "multicall is not available on the network " + network.chainId;
                            console.error(msg);
                            throw new Error(msg);
                        }
                        return [2 /*return*/, address];
                }
            });
        });
    };
    MulticallExecutor.prototype.networkSupportsMulticall = function () {
        return _tslib.__awaiter(this, void 0, void 0, function () {
            var provider, network, address;
            return _tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.providerSource()];
                    case 1:
                        provider = _a.sent();
                        return [4 /*yield*/, provider.getNetwork()];
                    case 2:
                        network = _a.sent();
                        address = this.multicallAddress(network.chainId);
                        return [2 /*return*/, address !== null];
                }
            });
        });
    };
    MulticallExecutor.prototype.multicallAddress = function (chainId) {
        switch (chainId) {
            case 1:
                return MULTICALL_ADDRESS_MAINNET;
            case 42:
                return MULTICALL_ADDRESS_KOVAN;
            case 4:
                return MULTICALL_ADDRESS_RINKEBY;
            case 5:
                return MULTICALL_ADDRESS_GOERLI;
            default:
                return null;
        }
    };
    return MulticallExecutor;
}());
//# sourceMappingURL=MulticallExecutor.js.map

exports.AGGREGATE_SELECTOR = AGGREGATE_SELECTOR;
exports.MULTICALL_ADDRESS_GOERLI = MULTICALL_ADDRESS_GOERLI;
exports.MULTICALL_ADDRESS_KOVAN = MULTICALL_ADDRESS_KOVAN;
exports.MULTICALL_ADDRESS_MAINNET = MULTICALL_ADDRESS_MAINNET;
exports.MULTICALL_ADDRESS_RINKEBY = MULTICALL_ADDRESS_RINKEBY;
exports.MulticallExecutor = MulticallExecutor;
