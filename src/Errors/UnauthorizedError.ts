import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';

/**
 * Represents an error raised when an unauthenticated user attempts to acccess a restricted resource.
 *
 * Will cause a 401 Unauthorized response to be sent to the client.
 */
export class UnauthorizedError extends HttpError {

    constructor(protected details: ValidationErrorItem[]) {
        super('UnauthorizedError', 401);
    }

    public body(): any {
        return this.details;
    }

}
