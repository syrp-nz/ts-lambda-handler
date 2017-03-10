import { ValidationErrorItem } from 'joi';
import { HttpError } from './HttpError';
/**
 * Represents an error raised by a validation issue with the client input.
 *
 * Will cause a 400 Bad Request to be sent to the client.
 */
export declare class ValidationError extends HttpError {
    protected details: ValidationErrorItem[];
    constructor(details: ValidationErrorItem[]);
}
