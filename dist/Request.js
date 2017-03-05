"use strict";
var Url = require("url");
var Request = (function () {
    function Request(event) {
        this.event = event;
        this.normalizeKeys(this.event.headers);
        this.normalizeKeys(this.event.queryStringParameters);
    }
    Object.defineProperty(Request.prototype, "data", {
        get: function () {
            return this.event;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Lower case all the keys in the provided list.
     * @param {[key:string]: string}
     */
    Request.prototype.normalizeKeys = function (list) {
        for (var key in list) {
            var value = list[key];
            delete list[key];
            list[key.toLowerCase()] = value;
        }
    };
    /**
     * Retrieve the a header value if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    Request.prototype.getHeader = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.headers, key, defaultVal);
    };
    /**
     * Retrieve a query string parameter if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    Request.prototype.getQueryStringParameter = function (key, defaultVal) {
        if (defaultVal === void 0) { defaultVal = ''; }
        return this.getValue(this.event.queryStringParameters, key, defaultVal);
    };
    /**
     * Retrieve a specific value from an array or return a default value.
     * @param  {[key:string]: string}    list
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    Request.prototype.getValue = function (list, key, defaultVal) {
        key = key.toLowerCase();
        if (list && list[key] != undefined) {
            return list[key];
        }
        else {
            return defaultVal;
        }
    };
    /**
     * Retrieve the content-type of this request as defined by the content-type header.
     * @return {string}
     */
    Request.prototype.getContentType = function () {
        return this.getHeader('content-type');
    };
    /**
     * Return the request origin's as defined by the origin header.
     * @return {string} [description]
     */
    Request.prototype.getOrigin = function () {
        return this.getHeader('origin');
    };
    /**
     * Return the request origin's domain.
     * @return {string} [description]
     */
    Request.prototype.getOriginDomain = function () {
        var origin = this.getOrigin();
        if (origin) {
            var url = Url.parse(origin);
            if (url.hostname) {
                return url.hostname;
            }
        }
        return '';
    };
    /**
     * Return the protocol of the Request Origin.
     * @return {string} [description]
     */
    Request.prototype.getOriginProtocol = function () {
        var origin = this.getOrigin();
        if (origin) {
            var url = Url.parse(origin);
            if (url.protocol) {
                return url.protocol.replace(/:$/, '');
            }
        }
        return '';
    };
    /**
     * Attempt to parse the body content has defined by the content type header
     * @return {any}
     */
    Request.prototype.getParseBody = function () {
        var parseBody = null;
        switch (this.getContentType()) {
            case 'text/json':
            case 'text/x-json':
            case 'application/json':
                parseBody = this.getBodyAsJSON();
                break;
            case 'text/plain':
            default:
                return this.event.body;
        }
        return parseBody;
    };
    /**
     * Attempt to parse the request body as JSON.
     * @return {any}
     */
    Request.prototype.getBodyAsJSON = function () {
        return JSON.parse(this.event.body);
    };
    return Request;
}());
exports.Request = Request;
//# sourceMappingURL=/var/www/LambdaHandler/src/Request.js.map