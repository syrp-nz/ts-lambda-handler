"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractHandler_1 = require("./AbstractHandler");
/**
 * An Handler that will systematically return nothing with a 200 status code. Can be usefull for testing, for replying to OPTION request or as a palceholder handler.
 */
var NoopHandler = (function (_super) {
    __extends(NoopHandler, _super);
    function NoopHandler() {
        return _super.apply(this, arguments) || this;
    }
    NoopHandler.prototype.process = function (request, response) {
        response.send();
        return Promise.resolve();
    };
    return NoopHandler;
}(AbstractHandler_1.AbstractHandler));
exports.NoopHandler = NoopHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/NoopHandler.js.map