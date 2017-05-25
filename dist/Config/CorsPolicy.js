"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility class to generate CORS Policy headers.
 */
var CorsPolicy = (function () {
    /**
     * Instanciate the CorsPolicy class
     * @param  {CorsPolicyRule} config Configuration use to build the CORS policy.
     */
    function CorsPolicy(config) {
        this.config = config;
    }
    /**
     * Build the CORS Policy headers
     * @param  {Request}           request
     */
    CorsPolicy.prototype.headers = function (request) {
        var headers = {};
        headers['Access-Control-Allow-Origin'] = this.allowedOrigins(request.getOriginDomain(), request.getOriginProtocol());
        headers['Access-Control-Allow-Headers'] = this.accessControlHeader(this.config.allowedHeaders);
        headers['Access-Control-Allow-Methods'] = this.accessControlHeader(this.config.allowedMethods);
        return headers;
    };
    /**
     * Generate Access Control headers from the provided value list. Use to generate the Allow-Headers and
     * Allow-Methods headers. If the value is a list of string, builds a concatenated list. Otherise return *
     * @param  {CorsAccessControlValue<string>} value
     * @return {string}
     */
    CorsPolicy.prototype.accessControlHeader = function (value) {
        if (value == '*') {
            return '*';
        }
        if (value != undefined) {
            var values = value;
            if (values.length > 0) {
                return values.join(',');
            }
        }
        // Default to allowing all
        return undefined;
    };
    /**
     * Build the Access-Control-Allow-Origin header value
     * @param  {string} originHost     Origin Domain of the request
     * @param  {string} originProtocol Origin protocol of the request
     * @return {string}
     */
    CorsPolicy.prototype.allowedOrigins = function (originHost, originProtocol) {
        var allowedOrigins = this.config.allowedOrigins;
        // If the allowedOrigins is not an array, return the value as-is.
        if (allowedOrigins == undefined || allowedOrigins == '*') {
            return allowedOrigins;
        }
        // Recast the allowed origin as an array for convenience.
        var allowedOriginsList = allowedOrigins;
        // If the list is empty, returned undefined. This will disallow remote requests.
        if (allowedOriginsList.length == 0) {
            return undefined;
        }
        // Lowercase everything before we start doing comparaisons.
        originHost = originHost.toLowerCase();
        allowedOriginsList = allowedOriginsList.map(function (str) {
            return str.toLowerCase();
        });
        // If we can't find the reques's origin in the list of allowed origin, disallow remote request.
        if (allowedOriginsList.indexOf(originHost) == -1) {
            return undefined;
        }
        // Confirm if we allow remote request from an HTTP host.
        if (originProtocol.toLowerCase() == 'http' && this.config.allowHttp) {
            return "http://" + originHost;
        }
        else {
            return "https://" + originHost;
        }
    };
    return CorsPolicy;
}());
exports.CorsPolicy = CorsPolicy;
//# sourceMappingURL=/var/www/LambdaHandler/src/Config/CorsPolicy.js.map