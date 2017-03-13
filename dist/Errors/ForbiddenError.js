"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HttpError_1 = require("./HttpError");
/**
 * Represents an error raised when an authenticated user attempts to perform anaction on a resource they do not have access to.
 *
 * Will cause a 403 Forbidden response to be sent to the client.
 */
var ForbiddenError = (function (_super) {
    __extends(ForbiddenError, _super);
    function ForbiddenError(details) {
        if (details === void 0) { details = [{
                message: 'UnauthorizedError',
                type: 'UnauthorizedError',
                path: ''
            }]; }
        return _super.call(this, 'ForbiddenError', 403, details) || this;
    }
    return ForbiddenError;
}(HttpError_1.HttpError));
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=/var/www/LambdaHandler/src/Errors/ForbiddenError.js.map