"use strict";
var ForbiddenError_1 = require("../Errors/ForbiddenError");
var UnauthorizedError_1 = require("../Errors/UnauthorizedError");
var JWT = require("jsonwebtoken");
/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
var JWTAuthorizer = (function () {
    /**
     * Instanciate a new JWTAuthorizer
     * @param  {string} secret Secret use to validate the JWT signature
     * @param  {[key: string]: string} attrMap What value from the payload should map to what value from the user.
     */
    function JWTAuthorizer(secret, attrMap) {
        if (attrMap === void 0) { attrMap = {}; }
        this.secret = secret;
        this.attrMap = attrMap;
    }
    JWTAuthorizer.prototype.getSecret = function () {
        return this.secret;
    };
    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request [description]
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    JWTAuthorizer.prototype.getUser = function (request) {
        // Get the Signature from the header
        var authHeader = request.getHeader('authorization');
        if (authHeader == '') {
            var anonymousUser = {
                id: null,
                anonymous: true,
                name: 'Anonymous'
            };
            return Promise.resolve(anonymousUser);
        }
        var matches = authHeader.match(/^Bearer +(.*)$/);
        if (!matches || matches.length != 2) {
            return Promise.reject(new UnauthorizedError_1.UnauthorizedError());
        }
        var signature = matches[1];
        try {
            var payload = JWT.verify(signature, this.getSecret());
            var user = this.extractValues(payload);
            return Promise.resolve(Object.assign(payload, user));
        }
        catch (error) {
            return Promise.reject(new UnauthorizedError_1.UnauthorizedError());
        }
    };
    /**
     * Confirm if the provided user as the appropriate priviledges to execute the request. JWTAuthorizer assumes that
     * any user that is not anonymous has access.
     * @param  {Request}           request
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}
     */
    JWTAuthorizer.prototype.isAuthorised = function (request, user) {
        if (user.anonymous && request.getMethod() != 'OPTIONS') {
            return Promise.reject(new ForbiddenError_1.ForbiddenError());
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Extract values from the payload based on the payload map and return a User.
     * @param  {[type]}        payload
     * @return {UserInterface}
     */
    JWTAuthorizer.prototype.extractValues = function (payload) {
        var user = {
            id: '',
            anonymous: false,
            name: ''
        };
        for (var key in this.attrMap) {
            user[key] = this.getValueFromPayload(payload, this.attrMap[key].split('.'));
        }
        return user;
    };
    /**
     * Retrieve a the value from a payload based on the provided path.
     * @param  {any}      payload
     * @param  {string[]} path
     */
    JWTAuthorizer.prototype.getValueFromPayload = function (payload, path) {
        if (path.length == 0) {
            return payload.toString();
        }
        else {
            var element = path.shift();
            var nextPayload = payload[element];
            if (nextPayload) {
                return this.getValueFromPayload(nextPayload, path);
            }
            else {
                return undefined;
            }
        }
    };
    return JWTAuthorizer;
}());
exports.JWTAuthorizer = JWTAuthorizer;
//# sourceMappingURL=/var/www/LambdaHandler/src/Authorizers/JWTAuthorizer.js.map