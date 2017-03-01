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
 * Represents an error raised by a validation issue with the client input.
 *
 * Will cause a 400 Bad Request to be sent to the client.
 */
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(details) {
        var _this = _super.call(this, 'ValidationError', 400) || this;
        _this.details = details;
        return _this;
    }
    ValidationError.prototype.body = function () {
        return this.details;
    };
    return ValidationError;
}(HttpError_1.HttpError));
exports.ValidationError = ValidationError;
//# sourceMappingURL=/var/www/lambdahandler/src/Errors/ValidationError.js.map