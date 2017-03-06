import { ForbiddenError } from '../Errors/ForbiddenError';
import { UnauthorizedError } from '../Errors/UnauthorizedError';
import { Request } from '../Request';
import { HandlerAuthorizer, UserInterface } from './HandlerAuthorizer';
import * as JWT from 'jsonwebtoken';
import { ValidationErrorItem } from 'joi'

/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
export class JWTAuthorizer implements HandlerAuthorizer {

    constructor (protected secret: string) {}

    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request [description]
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    public getUser(request: Request): Promise<UserInterface> {
        // Get the Signature from the header
        const authHeader = request.getHeader('authorization');
        const matches = authHeader.match(/^Bearer +(.*)$/);
        if (!matches || matches.length != 2) {
            return Promise.reject(new UnauthorizedError());
        }

        const signature = matches[1];
        try {
            var payload = JWT.verify(signature, this.secret);
            return Promise.resolve(payload);
        } catch (error) {
            return Promise.reject(new UnauthorizedError());
        }
    }

    /**
     * Retrieve the user associated to the given request.
     * @param  {[type]}           event [description]
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}       [description]
     */
    isAuthorised(event, user): Promise<void>;
}
