import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';

/**
 * Represents an error raised by a validation issue with the client input.
 *
 * Will cause a 400 Bad Request to be sent to the client.
 */
export class ValidationError extends HttpError {

    constructor(protected details: ValidationErrorItem[]) {
        super('ValidationError', 400);
    }

    public body(): any {
        return this.details;
    }

}
