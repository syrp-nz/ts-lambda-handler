import { APIGatewayEvent } from 'aws-lambda';
import { ForbiddenError } from '../Errors/ForbiddenError';
import { UnauthorizedError } from '../Errors/UnauthorizedError';

/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
export interface HandlerAuthorizer {

    /**
     * Retrieve the user associated to the given request.
     * @param  {[type]}           event [description]
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    getUser(event): Promise<UserInterface>;

    /**
     * Retrieve the user associated to the given request.
     * @param  {[type]}           event [description]
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}       [description]
     */
    isAuthorised(event): Promise<void>;
}

/**
 * Represent a minimalist user object.
 */
export interface UserInterface {
    /**
     * Unique identifier for the given user
     * @type {string}
     */
    id:string;

    /**
     * Whatever the current user is anonymous.
     * @type {boolean}
     */
    anonymous:boolean;
}
