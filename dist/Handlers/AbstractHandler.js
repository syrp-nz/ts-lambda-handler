"use strict";
var Request_1 = require("../Request");
var Response_1 = require("../Response");
var CorsPolicy_1 = require("../Config/CorsPolicy");
/**
 * Basic implementation of the Handler class. This is meant to provide an abstraction of an AWS request to facilitate the implementation of a Lambda function for a AWS Proxy request.
 */
var AbstractHandler = (function () {
    function AbstractHandler(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        this.config = config;
        /**
         * Flag to confirm the init method has been called.
         * @type {boolean}
         */
        this.isInit = false;
        /**
         * Proxy Handler method to you provide to AWS.
         * @type {ProxyHandler}
         */
        this.handle = function (event, context, callback) {
            try {
                _this.init(event, context, callback);
                console.assert(_this.isInit, 'Non-initialize Handler. Overridden init method on extended Handler must call parent.');
                _this.process(_this.request, _this.response);
            }
            catch (error) {
                _this.response.fail(error);
            }
        };
    }
    /**
     * Initialize the handler object. This method is called before the `process` method. You may override it for your own purpose, but make sure you call the parent method.
     * @param  {APIGatewayEvent} event
     * @param  {Context}         context
     * @param  {ProxyCallback}   callback
     */
    AbstractHandler.prototype.init = function (event, context, callback) {
        this.request = new Request_1.Request(event);
        this.response = new Response_1.Response(callback);
        if (this.config.cors) {
            var corsPolicy = new CorsPolicy_1.CorsPolicy(this.config.cors);
            var corsHeaders = corsPolicy.headers(this.request);
            this.response.addHeaders(corsHeaders);
        }
        // Confirm the handler has been Initialize
        this.isInit = true;
    };
    return AbstractHandler;
}());
exports.AbstractHandler = AbstractHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/AbstractHandler.js.map