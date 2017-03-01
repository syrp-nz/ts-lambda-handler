import { Request } from '../Request';
import { CorsPolicyRule } from './CorsPolicyRule';

export class CorsPolicy {

    constructor(protected config: CorsPolicyRule) { }

    /**
     * Build the CORS Policy headers
     * @param  {Request}           request
     * @return {CorsPolicyHeaders}
     */
    public headers(request: Request): {[key:string]: string} {
        const rules = this.config;
        const headers = {};

        // Check which headers we want to allow on request.
        if (rules.allowedHeaders && rules.allowedHeaders.length > 0) {
            headers['Access-Control-Allow-Headers'] = rules.allowedHeaders.join(',');
        } else {
            headers['Access-Control-Allow-Headers'] = '*';
        }

        // Check which methods we want to allow on request.
        if (rules.allowedMethods && rules.allowedMethods.length > 0) {
            headers['Access-Control-Allow-Methods'] = rules.allowedHeaders.join(',');
        } else {
            headers['Access-Control-Allow-Methods'] = '*';
        }

        // Check which domain origin we want to allow.
        if (rules.allowedOrigins && rules.allowedOrigins.length > 0) {
            // Let's get all the variables we need
            let origin = ''
            const originDomain = request.getOriginDomain();
            const originProtocol = request.getOriginProtocol();

            // Let's check which protocol we want to allow
            if (rules.allowHttp && originProtocol == 'http') {
                origin = 'http://';
            } else {
                origin = 'https://';
            }

            // Let's try finding the domain used to access the function in our list of allowed origin.
            const idx = rules.allowedOrigins.indexOf(originDomain);
            if (idx !== -1) {
                origin += rules.allowedOrigins[idx];
            } else {
                // We haven't found the domain, let's just returned the first domain
                origin += rules.allowedOrigins[0]
            }

            headers['Access-Control-Allow-Origin'] = origin;
        }

        return headers;
    }
}

export interface CorsPolicyHeaders {
    'Access-Control-Allow-Headers'?: string;
    'Access-Control-Allow-Methods'?: string;
    'Access-Control-Allow-Origin'?: string;
}
