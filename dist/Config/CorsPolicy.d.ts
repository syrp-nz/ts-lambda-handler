import { Request } from '../Request';
import { CorsPolicyRule } from './CorsPolicyRule';
export declare class CorsPolicy {
    protected config: CorsPolicyRule;
    constructor(config: CorsPolicyRule);
    /**
     * Build the CORS Policy headers
     * @param  {Request}           request
     * @return {CorsPolicyHeaders}
     */
    headers(request: Request): {
        [key: string]: string;
    };
}
export interface CorsPolicyHeaders {
    'Access-Control-Allow-Headers'?: string;
    'Access-Control-Allow-Methods'?: string;
    'Access-Control-Allow-Origin'?: string;
}
