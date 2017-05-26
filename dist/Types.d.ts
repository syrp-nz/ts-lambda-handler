/// <reference types="node" />
import { IncomingMessage } from 'http';
/**
 * Simple utility Hash array type
 */
export declare type ObjectMap<T> = {
    [key: string]: T;
};
/**
 * A Valid HTTP operation
 */
export declare type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
/**
 * An HTTP Request response containing both the response's message information and the response's body.
 *
 * Used by `ProxyHandler`.
 * @type {IncomingMessage}
 */
export interface ProxyResponse {
    message: IncomingMessage;
    body: string | Buffer;
}
/**
 * Accessible types for a CORS Policy Access-Control headers.
 */
export declare type CorsAccessControlValue<T> = T[] | '*' | undefined;
