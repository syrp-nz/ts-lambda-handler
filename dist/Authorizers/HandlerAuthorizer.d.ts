import { Request } from '../Request';
import { UserInterface } from './UserInterface';
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
     * Confirm if the provided user as the appropriate priviledges to execute the provided request.
     * @param  {Request}           request [description]
     * @param  {UserInterface}
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}       [description]
     */
    isAuthorised(request: Request, user: UserInterface): Promise<void>;
}
