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
 * Represents a `502 Bad Gateway` error. Should be returned when the handler is acting as a proxy for a third party
 * service and the third party fails.
 */
var BadGatewayError = (function (_super) {
    __extends(BadGatewayError, _super);
    function BadGatewayError(message) {
        if (message === void 0) { message = 'BadGatewayError'; }
        return _super.call(this, 'BadGatewayError', 502, [{
                message: message,
                type: 'BadGatewayError',
                path: ''
            }]) || this;
    }
    return BadGatewayError;
}(HttpError_1.HttpError));
exports.BadGatewayError = BadGatewayError;
//# sourceMappingURL=/var/www/LambdaHandler/src/Errors/BadGatewayError.js.map