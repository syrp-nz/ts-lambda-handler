import { ForbiddenError } from '../Errors/ForbiddenError';
import { UnauthorizedError } from '../Errors/UnauthorizedError';
import { Request } from '../Request';
import { HandlerAuthorizer } from './HandlerAuthorizer';
import { UserInterface } from './UserInterface';
import * as JWT from 'jsonwebtoken';
import { ValidationErrorItem } from 'joi'

/**
 * Represent a class that can determine if a user as the right to access a resource.
 */
export class JWTAuthorizer implements HandlerAuthorizer {

    /**
     * Instanciate a new JWTAuthorizer
     * @param  {string} secret Secret use to validate the JWT signature
     * @param  {[key: string]: string} attrMap What value from the payload should map to what value from the user.
     */
    constructor (
        protected secret: string,
        protected attrMap: {[key: string]: string} = {}
    ) {}

    protected getSecret(): string {
        return this.secret;
    }


    /**
     * Retrieve the user associated to the given request.
     * @param  {Request}           request [description]
     * @throws {UnauthorizedError}
     * @return {Promise<boolean>}       [description]
     */
    public getUser(request: Request): Promise<UserInterface> {
        return this.getJwtSignature(request).then((signature): Promise<UserInterface> => {

            if (signature == '') {
                const anonymousUser:UserInterface = {
                    id: null,
                    anonymous: true,
                    name: 'Anonymous'
                }
                return Promise.resolve(anonymousUser);
            }

            try {
                let payload = JWT.verify(signature, this.getSecret());
                const user = this.extractValues(payload);
                return Promise.resolve(Object.assign(payload, user));
            } catch (error) {
                return Promise.reject(new UnauthorizedError());
            }

        });
    }

    /**
     * Retrieve a JWT Signature string from the request or an empty string if none can be found.
     *
     * This method looks for the token in the `authorization`, but child classrd can override it to get the signature
     * from somewhere else.
     * @param  {[type]}          request [description]
     * @return {Promise<string>}         [description]
     */
    protected getJwtSignature(request: Request): Promise<string> {
        // Get the Signature from the header
        const authHeader = request.getHeader('authorization');

        // If the header is not define, just return a blank string.
        if (authHeader == '') {
            return Promise.resolve('');
        }

        // Otherwise extract the signature for the header
        const matches = authHeader.match(/^Bearer +([^ ]+)$/);
        if (!matches || matches.length != 2) {
            // The header doesn't match our expected regex, let's just deny access.
            return Promise.reject(new UnauthorizedError());
        }

        // Return the signature part of the match
        return Promise.resolve(matches[1]);
    }

    /**
     * Confirm if the provided user as the appropriate priviledges to execute the request. JWTAuthorizer assumes that
     * any user that is not anonymous has access.
     * @param  {Request}           request
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}
     */
    public isAuthorised(request: Request, user: UserInterface): Promise<void>{
        if (user.anonymous && request.getMethod() != 'OPTIONS') {
            return Promise.reject(new ForbiddenError());
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Extract values from the payload based on the payload map and return a User.
     * @param  {[type]}        payload
     * @return {UserInterface}
     */
    protected extractValues(payload): UserInterface {
        const user:UserInterface = {
            id: '',
            anonymous: false,
            name: ''
        }

        for (let key in this.attrMap) {
            user[key] = this.getValueFromPayload(payload, this.attrMap[key].split('.'));
        }

        return user;
    }

    /**
     * Retrieve a the value from a payload based on the provided path.
     * @param  {any}      payload
     * @param  {string[]} path
     */
    protected getValueFromPayload(payload:any, path:string[]):string {
        if (path.length == 0) {
            return payload.toString();
        } else {
            const element = path.shift();
            const nextPayload = payload[element];
            if (nextPayload) {
                return this.getValueFromPayload(nextPayload, path);
            } else {
                return undefined;
            }
        }
    }
}
