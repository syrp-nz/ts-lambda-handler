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
var HttpError_1 = require("./HttpError");
/**
 * Represents an error raised when an unauthenticated user attempts to acccess a restricted resource.
 *
 * Will cause a 401 Unauthorized response to be sent to the client.
 */
var UnauthorizedError = (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError() {
        return _super.call(this, 'UnauthorizedError', 401, [{
                message: 'UnauthorizedError',
                type: 'UnauthorizedError',
                path: ''
            }]) || this;
    }
    return UnauthorizedError;
}(HttpError_1.HttpError));
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=/var/www/LambdaHandler/src/Errors/UnauthorizedError.js.map