/**
 * Represent Rules to generate a CORS policy
 */
export interface CorsPolicyRule {
    /**
     * List of allowed headers on the request. Will default to * if undefined
     */
    allowedHeaders?: string[];

    /**
     * List of allowed method on the request. Will default to * if undefined
     */
    allowedMethods?: string[];

    /**
     * List of allowed origins without the protocol. The handler will automatically respond with the request's stated hostname if it matches one of the entry. If undefined, the header will not be returned.
     */
    allowedOrigins?: string[];

    /**
     * Define if our CORS policy allow HTTP request.
     */
    allowHttp?: boolean;
}
