"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Represent an HTTP Error to return to the client. `Response` can convert this error to the appropriate ProxyResponse.
 */
var HttpError = (function (_super) {
    __extends(HttpError, _super);
    function HttpError(message, statusCode, body) {
        if (statusCode === void 0) { statusCode = 500; }
        if (body === void 0) { body = null; }
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.statusCode = statusCode;
        _this.body = body;
        /**
         * If this is set to true the error should be reported back to the client.
         * @type {boolean}
         */
        _this.passthrough = true;
        return _this;
    }
    return HttpError;
}(Error));
exports.HttpError = HttpError;
//# sourceMappingURL=/var/www/LambdaHandler/src/Errors/HttpError.js.map