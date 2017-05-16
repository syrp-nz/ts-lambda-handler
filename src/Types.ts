import { IncomingMessage } from 'http';
import { Buffer } from 'buffer';


export type Map<T> = {[key: string]: T};

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

export interface ProxyResponse {
    message: IncomingMessage,
    body: string | Buffer
}
