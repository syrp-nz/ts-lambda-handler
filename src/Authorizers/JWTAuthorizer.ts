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
        // Get the Signature from the header
        const authHeader = request.getHeader('authorization');

        if (authHeader == '') {
            const anonymousUser:UserInterface = {
                id: null,
                anonymous: true,
                name: 'Anonymous'
            }
            return Promise.resolve(anonymousUser);
        }

        const matches = authHeader.match(/^Bearer +(.*)$/);
        if (!matches || matches.length != 2) {
            return Promise.reject(new UnauthorizedError());
        }


        const signature = matches[1];
        try {
            let payload = JWT.verify(signature, this.getSecret());
            const user = this.extractValues(payload);
            return Promise.resolve(Object.assign(payload, user));
        } catch (error) {
            return Promise.reject(new UnauthorizedError());
        }
    }

    /**
     * Confirm if the provided user as the appropriate priviledges to execute the request. JWTAuthorizer assumes that
     * any user that is not anonymous has access.
     * @param  {Request}           request
     * @throws {ForbiddenError}
     * @return {Promise<boolean>}
     */
    public isAuthorised(request: Request, user: UserInterface): Promise<void>{
        if (user.anonymous) {
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
