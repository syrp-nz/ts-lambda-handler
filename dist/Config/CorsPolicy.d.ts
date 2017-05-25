import { Request } from '../Request';
import { CorsPolicyRule } from './CorsPolicyRule';
import { Map } from '../Types';
/**
 * Utility class to generate CORS Policy headers.
 */
export declare class CorsPolicy {
    protected config: CorsPolicyRule;
    /**
     * Instanciate the CorsPolicy class
     * @param  {CorsPolicyRule} config Configuration use to build the CORS policy.
     */
    constructor(config: CorsPolicyRule);
    /**
     * Build the CORS Policy headers
     * @param  {Request}           request
     */
    headers(request: Request): Map<string>;
    /**
     * Generate Access Control headers from the provided value list. Use to generate the Allow-Headers and
     * Allow-Methods headers. If the value is a list of string, builds a concatenated list. Otherise return *
     * @param  {CorsAccessControlValue<string>} value
     * @return {string}
     */
    private accessControlHeader(value);
    /**
     * Build the Access-Control-Allow-Origin header value
     * @param  {string} originHost     Origin Domain of the request
     * @param  {string} originProtocol Origin protocol of the request
     * @return {string}
     */
    private allowedOrigins(originHost, originProtocol);
}
