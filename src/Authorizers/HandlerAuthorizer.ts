import { ForbiddenError } from '../Errors/ForbiddenError';
import { UnauthorizedError } from '../Errors/UnauthorizedError';
import { Request } from '../Request';

/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
export interface HandlerAuthorizer {

    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    getUser(request: Request): Promise<UserInterface>;

    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request [description]
     * @param  {UserInterface}
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}       [description]
     */
    isAuthorised(event: Request, user: UserInterface): Promise<void>;
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
