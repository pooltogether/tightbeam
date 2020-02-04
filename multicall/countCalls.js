'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var graphql = _interopDefault(require('graphql-anywhere'));

function countCalls(document) {
    var context = {
        count: 0
    };
    function resolver(fieldName, rootValue, args, context, info) {
        var directives = info.directives;
        if (fieldName === 'call' && directives && 'client' in directives) {
            context.count++;
        }
    }
    graphql(resolver, document, null, context);
    return context.count;
}
//# sourceMappingURL=countCalls.js.map

exports.countCalls = countCalls;
