import { ValidationErrorItem } from 'joi';
import { HttpError } from './HttpError';
/**
 * Represents an error raised when an authenticated user attempts to perform anaction on a resource they do not have access to.
 *
 * Will cause a 403 Forbidden response to be sent to the client.
 */
export declare class ForbiddenError extends HttpError {
    constructor(details?: ValidationErrorItem[]);
}
