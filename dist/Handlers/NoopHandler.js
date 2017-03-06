"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractHandler_1 = require("./AbstractHandler");
/**
 * An Handler that will systematically return nothing with a 200 status code. Can be usefull for testing, for replying to OPTION request or as a palceholder handler.
 */
var NoopHandler = (function (_super) {
    __extends(NoopHandler, _super);
    function NoopHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoopHandler.prototype.process = function (request, response) {
        response.send();
    };
    return NoopHandler;
}(AbstractHandler_1.AbstractHandler));
exports.NoopHandler = NoopHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/NoopHandler.js.map