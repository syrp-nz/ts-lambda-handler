import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';

/**
 * Simple utility Hash array type
 */
export type ObjectMap<T> = {[key: string]: T};

/**
 * A Valid HTTP operation
 */
export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

/**
 * Enumaration of valid HTTP verbs.
 */
export const HttpVerbs = Object.freeze({
    GET:        'GET',
    POST:       'POST',
    PUT:        'PUT',
    DELETE:     'DELETE',
    OPTIONS:    'OPTIONS',
    PATCH:      'PATCH'
});

/**
 * An HTTP Request response containing both the response's message information and the response's body.
 *
 * Used by `ProxyHandler`.
 * @type {IncomingMessage}
 */
export interface ProxyResponse {
    message: IncomingMessage,
    body: string | Buffer
}

/**
 * Accessible types for a CORS Policy Access-Control headers.
 */
export type CorsAccessControlValue<T> = T[]|'*'|undefined;
