import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';

/**
 * Represents an error raised when the client attempts to access a ressource that doesn't exist.
 */
export class NotFoundError extends HttpError {

    constructor() {
        super('NotFoundError', 404,  [{
            message: 'NotFoundError',
            type: 'NotFoundError',
            path: ''
        }]);
    }

}
