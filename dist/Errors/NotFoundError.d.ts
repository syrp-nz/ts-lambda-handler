import { HttpError } from './HttpError';
/**
 * Represents an error raised when the client attempts to access a ressource that doesn't exist.
 */
export declare class NotFoundError extends HttpError {
    constructor();
}
