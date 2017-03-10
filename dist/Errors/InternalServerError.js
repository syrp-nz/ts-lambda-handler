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
 * Represents an error raised by an Internal Server Error. Will print out a reference to a CloudWatch error log.
 *
 * Will cause a 500 Internal Server Error to be sent to the client.
 */
var InternalServerError = (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(logReference) {
        return _super.call(this, 'InternalServerError', 500, [{
                message: 'Error log reference :\n' + JSON.stringify(logReference),
                type: 'Internal Server Error',
                path: ''
            }]) || this;
    }
    return InternalServerError;
}(HttpError_1.HttpError));
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=/var/www/LambdaHandler/src/Errors/InternalServerError.js.map