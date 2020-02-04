'use strict';

var _tslib = require('../_virtual/_tslib');
var Call = require('./Call.js');
var encodeCalls = require('./encodeCalls.js');
var decodeCalls = require('./decodeCalls.js');

var MulticallBatch = /** @class */ (function () {
    function MulticallBatch(executor) {
        this.executor = executor;
        this.calls = [];
        this.batchSize = 0;
    }
    MulticallBatch.prototype.setBatchSize = function (batchSize) {
        this.batchSize = batchSize;
    };
    MulticallBatch.prototype.call = function (transaction) {
        return _tslib.__awaiter(this, void 0, void 0, function () {
            var resolveCb, rejectCb, promise, to, data, call, e_1;
            var _this = this;
            return _tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promise = new Promise(function (resolve, reject) {
                            resolveCb = resolve;
                            rejectCb = reject;
                        });
                        return [4 /*yield*/, transaction.to];
                    case 1:
                        to = _a.sent();
                        return [4 /*yield*/, transaction.data];
                    case 2:
                        data = _a.sent();
                        call = new Call.Call(to, data, resolveCb, rejectCb);
                        this.calls.push(call);
                        return [4 /*yield*/, this.canExecute()];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.execute()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.calls.map(function (call) { return _tslib.__awaiter(_this, void 0, void 0, function () { return _tslib.__generator(this, function (_a) {
                            return [2 /*return*/, call.reject(e_1.message)];
                        }); }); });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, promise];
                }
            });
        });
    };
    MulticallBatch.prototype.canExecute = function () {
        return _tslib.__awaiter(this, void 0, Promise, function () {
            var isMulticall;
            return _tslib.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executor.networkSupportsMulticall()];
                    case 1:
                        isMulticall = _a.sent();
                        return [2 /*return*/, !isMulticall || this.calls.length >= this.batchSize];
                }
            });
        });
    };
    MulticallBatch.prototype.execute = function () {
        return _tslib.__awaiter(this, void 0, void 0, function () {
            var data, returnData, _a, blockNumber, returnValues, i;
            return _tslib.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = encodeCalls.encodeCalls(this.calls);
                        return [4 /*yield*/, this.executor.execute(data)];
                    case 1:
                        returnData = _b.sent();
                        _a = decodeCalls.decodeCalls(returnData), blockNumber = _a[0], returnValues = _a[1];
                        for (i = 0; i < returnValues.length; i++) {
                            this.calls[i].resolve(returnValues[i]);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return MulticallBatch;
}());
//# sourceMappingURL=MulticallBatch.js.map

exports.MulticallBatch = MulticallBatch;
