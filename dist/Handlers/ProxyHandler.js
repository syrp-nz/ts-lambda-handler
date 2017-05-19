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
var Errors_1 = require("../Errors");
var HttpRequest = require("request");
var Functions_1 = require("../Utilities/Functions");
var DEFAULT_CONFIG = {
    baseUrl: '/',
    pathParameterName: 'path',
    ssl: true,
    processOptionsLocally: true,
    whiteListedHeaders: new Array(),
    whiteListedResponseHeaders: new Array(),
};
/**
 * An handler to relay a request through a proxy.
 */
var ProxyHandler = (function (_super) {
    __extends(ProxyHandler, _super);
    /**
     * Instanciate the Proxy Handler
     * @param  {string}         remoteHost Host where the requests will be rerouted
     * @param  {string}         remotePath Remote path where the request will be rerouted.
     * @param  {string}         pathParameterName Name of the Path Parameter on the AWS request object
     * @param  {HandlerConfig}  config
     * @param  {boolean}        processOptionsLocally Whatever OPTIONS request should be process locally or relayed to
     *                                                the remote host
     */
    function ProxyHandler(remoteHost, config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.remoteHost = remoteHost;
        _this.config = config;
        /**
         * Reference to the `request` module. We could call the module directly, but that make it more difficult to unit
         * test.
         */
        _this.httpRequest = HttpRequest;
        _this.config = Object.assign({}, DEFAULT_CONFIG, config);
        return _this;
    }
    ProxyHandler.prototype.process = function (request, response) {
        var _this = this;
        // If this is an option request and our config instruct us not to relay option request.
        if (this.config.processOptionsLocally && this.getMethod() == 'OPTIONS') {
            // Send an empty reponse.
            this.response.send();
            return Promise.resolve();
        }
        return this.buildProxyOptions()
            .then(function (options) { return _this.proxyRequest(options); })
            .then(function (proxyResponse) { return _this.processResponse(proxyResponse.message, proxyResponse.body); })
            .then(function () {
            _this.response.send();
        });
    };
    /**
     * Perform an HTTP/HTTPS request.
     * @param  {NodeRequest.Options}    options [description]
     * @return {Promise<ProxyResponse>}         [description]
     */
    ProxyHandler.prototype.proxyRequest = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.httpRequest(options, function (error, incomingMessage, response) {
                if (error) {
                    // Don't log the original error when in testing mode.
                    Functions_1.isInTestingMode() || console.error(error);
                    reject(new Errors_1.BadGatewayError());
                }
                else {
                    resolve({ message: incomingMessage, body: response });
                }
            });
        });
    };
    /**
     * Build the options for the request to the remove server. THis method can be overriden to customise the request.
     * By default:
     * * the host is read from the remote host pass to the constructor,
     * * the port defaults to 443,
     * * the path is determined from `requestRemotePath`,
     * * the method is read from original AWS request,
     * * the header fi
     *
     * @return {Promise<Https.RequestOptions>} [description]
     */
    ProxyHandler.prototype.buildProxyOptions = function () {
        var options = {
            port: this.getRemotePort(),
            url: this.getRemoteHost() + this.getRemoteBaseUrl() + this.getRemotePath(),
            method: this.getMethod(),
            headers: this.getRemoteHeaders(),
            qs: this.getQueryStringParameters(),
            body: this.getRemoteBody()
        };
        if (this.config.ssl) {
            options.strictSSL = true;
        }
        return Promise.resolve(options);
    };
    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    ProxyHandler.prototype.getRemoteHost = function () {
        return "http" + (this.config.ssl ? 's' : '') + "://" + this.remoteHost;
    };
    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    ProxyHandler.prototype.getRemotePort = function () {
        if (this.config.port) {
            return this.config.port;
        }
        else {
            // If the port is not explicitly define use the protocol to pick which port to use.
            return this.config.ssl ? 443 : 80;
        }
    };
    /**
     * Build the Path of the remote request. This method can be overriden to alter where the request are directed.
     */
    ProxyHandler.prototype.getRemoteBaseUrl = function () {
        return (this.config.baseUrl.match(/^\//) ? '' : '/') +
            this.config.baseUrl +
            (this.config.baseUrl.match(/\/$/) ? '' : '/'); // Add slash if remote path doesn't end with one
    };
    /**
     * [getRemotePath description]
     * @return {string} [description]
     */
    ProxyHandler.prototype.getRemotePath = function () {
        return this.request.getPathParameter(this.config.pathParameterName);
    };
    /**
     * Get the HTTP method to use to communicate with the proxy.
     * @return {HttpVerb} [description]
     */
    ProxyHandler.prototype.getMethod = function () {
        return this.request.getMethod();
    };
    /**
     * Build a list of headers that should be attached to the proxy request. The default behavior is to return all white
     * listed headers from the original request.
     *
     * This method can also be overriden to provide a custom list of headers.
     */
    ProxyHandler.prototype.getRemoteHeaders = function () {
        var _this = this;
        var headers = {};
        this.config.whiteListedHeaders.forEach(function (header) {
            var headerValue = _this.request.getHeader(header);
            if (headerValue != '') {
                headers[header] = headerValue;
            }
        });
        return headers;
    };
    /**
     * Return the query string parameter that will be added to the proxy request.
     */
    ProxyHandler.prototype.getQueryStringParameters = function () {
        return this.request.data.queryStringParameters;
    };
    /**
     * Get the body of the proxy request as a string. Default behavior is to return the body of the original request.
     * @return {string}
     */
    ProxyHandler.prototype.getRemoteBody = function () {
        return this.request.data.body;
    };
    /**
     * Process a proxy response and update the Handler's response to match. This method can be overriden if the
     * Handler's response need to be modified in some way before being sent back to the client.
     * @param  {http.IncomingMessage} incomingMessage
     * @param  {string|Buffer}        response
     * @return {Promise<void>}
     */
    ProxyHandler.prototype.processResponse = function (incomingMessage, body) {
        var _this = this;
        this.response.setStatusCode(incomingMessage.statusCode);
        // Lowercase all the header keys.
        var headers = incomingMessage.headers;
        for (var key in headers) {
            var lowerCaseKey = key.toLowerCase();
            if (key != lowerCaseKey) {
                headers[lowerCaseKey] = headers[key];
                delete headers[key];
            }
        }
        // Find headers we can returned to the user.
        this.config.whiteListedResponseHeaders.forEach(function (key) {
            var lowerCaseKey = key.toLowerCase();
            if (headers[lowerCaseKey] != undefined) {
                _this.response.addHeader(key, headers[lowerCaseKey]);
            }
        });
        this.response.setBody(body.toString());
        return Promise.resolve();
    };
    return ProxyHandler;
}(AbstractHandler_1.AbstractHandler));
exports.ProxyHandler = ProxyHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/ProxyHandler.js.map