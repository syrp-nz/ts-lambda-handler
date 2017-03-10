import { HttpError } from './HttpError';
/**
 * Represents an error raised when an unauthenticated user attempts to acccess a restricted resource.
 *
 * Will cause a 401 Unauthorized response to be sent to the client.
 */
export declare class UnauthorizedError extends HttpError {
    constructor();
}
