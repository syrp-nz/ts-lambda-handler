import { Request } from '../Request';
import { HandlerAuthorizer } from './HandlerAuthorizer';
import { UserInterface } from './UserInterface';
/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
export declare class JWTAuthorizer implements HandlerAuthorizer {
    protected secret: string;
    protected attrMap: {
        [key: string]: string;
    };
    /**
     * Instanciate a new JWTAuthorizer
     * @param  {string} secret Secret use to validate the JWT signature
     * @param  {[key: string]: string} attrMap What value from the payload should map to what value from the user.
     */
    constructor(secret: string, attrMap?: {
        [key: string]: string;
    });
    protected getSecret(): string;
    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request [description]
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    getUser(request: Request): Promise<UserInterface>;
    /**
     * Retrieve a JWT Signature string from the request or an empty string if none can be found.
     *
     * This method looks for the token in the `authorization`, but child classrd can override it to get the signature
     * from somewhere else.
     * @param  {[type]}          request [description]
     * @return {Promise<string>}         [description]
     */
    protected getJwtSignature(request: Request): Promise<string>;
    /**
     * Confirm if the provided user as the appropriate priviledges to execute the request. JWTAuthorizer assumes that
     * any user that is not anonymous has access.
     * @param  {Request}           request
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}
     */
    isAuthorised(request: Request, user: UserInterface): Promise<void>;
    /**
     * Extract values from the payload based on the payload map and return a User.
     * @param  {[type]}        payload
     * @return {UserInterface}
     */
    protected extractValues(payload: any): UserInterface;
    /**
     * Retrieve a the value from a payload based on the provided path.
     * @param  {any}      payload
     * @param  {string[]} path
     */
    protected getValueFromPayload(payload: any, path: string[]): string;
}
