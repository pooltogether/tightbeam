'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _tslib = require('./_virtual/_tslib');
var gql = _interopDefault(require('graphql-tag'));

var typeDefs = gql(templateObject_1 || (templateObject_1 = _tslib.__makeTemplateObject(["\n  type TransactionParams {\n    values: [String]\n  }\n\n  type Transaction {\n    id: ID!\n    fn: String\n    name: String\n    abi: String\n    address: String\n    completed: Boolean\n    sent: Boolean\n    hash: String\n    error: String\n    gasLimit: String\n    gasPrice: String\n    scaleGasEstimate: String\n    minimumGas: String\n    blockNumber: Float\n    params: TransactionParams\n    value: String\n  }\n\n  extend type Query {\n    transactions(id: String): [Transaction]\n  }\n\n  extend type Mutation {\n    sendTransaction(\n      abi: String,\n      name: String,\n      address: String,\n      fn: String,\n      params: TransactionParams,\n      gasLimit: String,\n      gasPrice: String,\n      value: String,\n      scaleGasEstimate: String,\n      minimumGas: String\n    ): Transaction\n  }\n"], ["\n  type TransactionParams {\n    values: [String]\n  }\n\n  type Transaction {\n    id: ID!\n    fn: String\n    name: String\n    abi: String\n    address: String\n    completed: Boolean\n    sent: Boolean\n    hash: String\n    error: String\n    gasLimit: String\n    gasPrice: String\n    scaleGasEstimate: String\n    minimumGas: String\n    blockNumber: Float\n    params: TransactionParams\n    value: String\n  }\n\n  extend type Query {\n    transactions(id: String): [Transaction]\n  }\n\n  extend type Mutation {\n    sendTransaction(\n      abi: String,\n      name: String,\n      address: String,\n      fn: String,\n      params: TransactionParams,\n      gasLimit: String,\n      gasPrice: String,\n      value: String,\n      scaleGasEstimate: String,\n      minimumGas: String\n    ): Transaction\n  }\n"])));
var templateObject_1;
//# sourceMappingURL=typeDefs.js.map

exports.typeDefs = typeDefs;
