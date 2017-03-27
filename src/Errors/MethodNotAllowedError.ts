import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';

/**
 * Represents an error raised when the client attempts to access a ressource that doesn't exist.
 */
export class MethodNotAllowedError extends HttpError {

    constructor() {
        super('MethodNotAllowedError', 405,  [{
            message: 'MethodNotAllowedError',
            type: 'MethodNotAllowedError',
            path: ''
        }]);
    }

}
