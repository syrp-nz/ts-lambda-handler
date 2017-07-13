import { Request } from '../Request';
import { CorsPolicyRule } from './CorsPolicyRule';
import { ObjectMap, CorsAccessControlValue, HttpVerb } from '../Types'

/**
 * Utility class to generate CORS Policy headers.
 */
export class CorsPolicy {

    /**
     * Instanciate the CorsPolicy class
     * @param  {CorsPolicyRule} config Configuration use to build the CORS policy.
     */
    constructor(protected config: CorsPolicyRule) { }

    /**
     * Build the CORS Policy headers
     * @param  {Request}           request
     */
    public headers(request: Request): ObjectMap<string> {
        const headers: ObjectMap<string> = {};

        headers['Access-Control-Allow-Origin'] = this.allowedOrigins(
            request.getOriginDomain(),
            request.getOriginProtocol(),
            request.getOriginPort(),
        );

        headers['Access-Control-Allow-Headers'] = this.accessControlHeader(this.config.allowedHeaders);
        headers['Access-Control-Allow-Methods'] = this.accessControlHeader(this.config.allowedMethods);

        return headers;
    }

    /**
     * Generate Access Control headers from the provided value list. Use to generate the Allow-Headers and
     * Allow-Methods headers. If the value is a list of string, builds a concatenated list. Otherise return *
     * @param  {CorsAccessControlValue<string>} value
     * @return {string}
     */
    private accessControlHeader(value: CorsAccessControlValue<string>): string {
        if (value == '*') {
            return '*';
        }

        if (value != undefined) {
            const values: string[] = value;
            if (values.length > 0) {
                return values.join(',');
            }
        }

        // Default to allowing all
        return undefined;
    }

    /**
     * Build the Access-Control-Allow-Origin header value
     * @param  {string} originHost     Origin Domain of the request
     * @param  {string} originProtocol Origin protocol of the request
     * @return {string}
     */
    private allowedOrigins(originHost: string, originProtocol:string, originPort:string = '' ): string {
        const allowedOrigins = this.config.allowedOrigins;

        // If the allowedOrigins is not an array, return the value as-is.
        if (allowedOrigins == undefined || allowedOrigins == '*') {
            return <string>allowedOrigins;
        }

        // Recast the allowed origin as an array for convenience.
        let allowedOriginsList: string[] = allowedOrigins;

        // If the list is empty, returned undefined. This will disallow remote requests.
        if (allowedOriginsList.length == 0) {
            return undefined;
        }

        // Lowercase everything before we start doing comparaisons.
        originHost = originHost.toLowerCase();

        allowedOriginsList = allowedOriginsList.map((str) => {
            return str.toLowerCase();
        });

        // Append the port number if need be
        if (originPort && originPort.trim() != '' ) {
            originHost += ':' + originPort;
        }


        // If we can't find the request's origin in the list of allowed origin, disallow remote request.
        if (allowedOriginsList.indexOf(originHost) == -1) {
            return undefined
        }

        // Confirm if we allow remote request from an HTTP host.
        if (originProtocol.toLowerCase() == 'http' && this.config.allowHttp) {
            return `http://${originHost}`;
        } else {
            return `https://${originHost}`;
        }
    }
}
