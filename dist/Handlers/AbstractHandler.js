"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Request_1 = require("../Request");
var Response_1 = require("../Response");
var InternalServerError_1 = require("../Errors/InternalServerError");
var CorsPolicy_1 = require("../Config/CorsPolicy");
var Functions_1 = require("../Utilities/Functions");
/**
 * Basic implementation of the Handler class. This is meant to provide an abstraction of an AWS request to facilitate the implementation of a Lambda function for a AWS Proxy request.
 */
var AbstractHandler = (function () {
    function AbstractHandler(config) {
        if (config === void 0) { config = {}; }
        var _this = this;
        this.config = config;
        this.user = null;
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
                _this.init(event, context, callback)
                    .then(function () {
                    console.assert(_this.isInit, 'Non-initialize Handler. Overridden init method on extended Handler must call parent.');
                    return _this.authorize();
                }).then(function () {
                    return _this.process(_this.request, _this.response);
                }).catch(function (error) {
                    _this.errorHandler(error);
                }).then(function () {
                    // By this point, the response should have been sent.
                    if (!_this.response.sent) {
                        throw new Error('Handler Response was never sent.');
                    }
                });
            }
            catch (error) {
                _this.errorHandler(error);
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
        var _this = this;
        this.request = new Request_1.Request(event);
        this.response = new Response_1.Response(callback);
        this.context = context;
        if (this.config.cors) {
            var corsPolicy = new CorsPolicy_1.CorsPolicy(this.config.cors);
            var corsHeaders = corsPolicy.headers(this.request);
            this.response.addHeaders(corsHeaders);
        }
        return this.decryptEnvVarsFromConfig().then(function () {
            // Confirm the handler has been Initialize
            _this.isInit = true;
            return Promise.resolve();
        });
    };
    /**
     * Decrypt some environement variables as specified in the COnfiguration for the Handler
     * @return {Promise<void>} [description]
     */
    AbstractHandler.prototype.decryptEnvVarsFromConfig = function () {
        // Check if there's any variable to decrypt
        if (this.config.encryptedEnvironmentVariables) {
            // Convert the array of variables to decrypt to an array promises.
            var promises = this.config.encryptedEnvironmentVariables.map(function (param) {
                return Functions_1.decryptEnvVar(param.cipherVarName, param.decryptedVarName, param.encoding);
            });
            // Return a promise that will resolve once all the variables have been decrypted.
            return Promise.all(promises).then(function () { return Promise.resolve(); });
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Determine if the current user can perform the current request. Return a promise that will return true if there's
     * a valid authorizer assigned to this handler or false if there's no authorizer define for this handler.
     *
     * Invalid credentials will be handle via Promise rejection.
     * @return {Promise<boolean>} [description]
     */
    AbstractHandler.prototype.authorize = function () {
        var _this = this;
        if (this.config.authorizer) {
            return this.config.authorizer
                .getUser(this.request)
                .then(function (user) {
                _this.user = user;
                return _this.config.authorizer.isAuthorised(_this.request, user);
            })
                .then(function () { return Promise.resolve(true); });
        }
        else {
            return Promise.resolve(false);
        }
    };
    AbstractHandler.prototype.errorHandler = function (error) {
        if (error.passthrough) {
            this.response.fail(error);
        }
        else {
            console.error(error);
            this.response.fail(new InternalServerError_1.InternalServerError({
                'Region': process.env.AWS_REGION,
                'Function': this.context.functionName,
                'Name': this.context.logStreamName,
                'Request': this.context.awsRequestId,
            }));
        }
    };
    return AbstractHandler;
}());
exports.AbstractHandler = AbstractHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/AbstractHandler.js.map