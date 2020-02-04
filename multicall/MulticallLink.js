'use strict';

var _tslib = require('../_virtual/_tslib');
var apolloLink = require('apollo-link');
var countCalls = require('./countCalls.js');
var MulticallBatch = require('./MulticallBatch.js');
var MulticallExecutor = require('./MulticallExecutor.js');

var MulticallLink = /** @class */ (function (_super) {
    _tslib.__extends(MulticallLink, _super);
    function MulticallLink(providerSource) {
        var _this = _super.call(this) || this;
        _this.multicallExecutor = new MulticallExecutor.MulticallExecutor(providerSource);
        return _this;
    }
    MulticallLink.prototype.request = function (operation, forward) {
        var multicallBatch = new MulticallBatch.MulticallBatch(this.multicallExecutor);
        multicallBatch.setBatchSize(countCalls.countCalls(operation.query));
        operation.setContext(function (context) { return (_tslib.__assign({ multicallBatch: multicallBatch }, context)); });
        var observer = forward(operation);
        return observer;
    };
    return MulticallLink;
}(apolloLink.ApolloLink));
//# sourceMappingURL=MulticallLink.js.map

exports.MulticallLink = MulticallLink;
