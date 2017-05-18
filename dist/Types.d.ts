/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare type Map<T> = {
    [key: string]: T;
};
export declare type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
export interface ProxyResponse {
    message: IncomingMessage;
    body: string | Buffer;
}
