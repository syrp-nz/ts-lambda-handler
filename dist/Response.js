"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpError_1 = require("./Errors/HttpError");
var buffer_1 = require("buffer");
var Response = (function () {
    function Response(callback) {
        this.callback = callback;
        this.statusCode = 200;
        this.headers = {};
        this.body = null;
    }
    /**
     * Set the status code of the response. Defaults to 200.
     * @type {number}
     * @return {this}
     */
    Response.prototype.setStatusCode = function (status) {
        this.statusCode = status;
        return this;
    };
    /**
     * Add a header to this response.
     * @param  {string} key
     * @param  {string} value
     * @return {this}
     */
    Response.prototype.addHeader = function (key, value) {
        this.headers[key] = value;
        return this;
    };
    /**
     * Add a multiple headers to the response
     * @param  { [key: string] : string } } headers
     * @return {this}
     */
    Response.prototype.addHeaders = function (headers) {
        Object.assign(this.headers, headers);
        return this;
    };
    /**
     * Remove a header from the response.
     * @param  {string} key
     * @return {this}
     */
    Response.prototype.removeHeader = function (key) {
        if (this.headers[key] != undefined) {
            delete this.headers[key];
        }
        return this;
    };
    /**
     * Receives something and try to convert it to a string for hte body.
     * @param  {any}  body [description]
     * @return {this}      [description]
     */
    Response.prototype.setBody = function (body) {
        var type = typeof body;
        switch (type) {
            case 'undefined':
                this.body = null;
                break;
            case 'string':
                this.body = body;
                break;
            case 'array':
            case 'object':
                if (body instanceof buffer_1.Buffer) {
                    this.body = body.toString('utf-8');
                }
                else if (body === null) {
                    this.body = null;
                }
                else {
                    this.body = JSON.stringify(body);
                }
                break;
            default:
                this.body = body.toString();
        }
        return this;
    };
    Response.prototype.send = function () {
        this.callback(null, this);
    };
    Response.prototype.fail = function (error) {
        if (error instanceof HttpError_1.HttpError) {
            var httpError = error;
            this.statusCode = httpError.statusCode;
            this.setBody(httpError.body());
            this.send();
        }
        else {
            this.callback(error);
        }
    };
    return Response;
}());
exports.Response = Response;
//# sourceMappingURL=/var/www/LambdaHandler/src/Response.js.map