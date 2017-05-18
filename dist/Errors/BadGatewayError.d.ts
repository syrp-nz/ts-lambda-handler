import { HttpError } from './HttpError';
/**
 * Represents a `502 Bad Gateway` error. Should be returned when the handler is acting as a proxy for a third party
 * service and the third party fails.
 */
export declare class BadGatewayError extends HttpError {
    constructor(message?: string);
}
