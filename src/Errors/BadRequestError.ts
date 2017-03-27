import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';

/**
 * Represents an error raised when the client attempts to access a ressource that doesn't exist.
 */
export class BadRequestError extends HttpError {

    constructor() {
        super('BadRequestError', 400,  [{
            message: 'BadRequestError',
            type: 'BadRequestError',
            path: ''
        }]);
    }

}
