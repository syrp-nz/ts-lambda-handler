import { ProxyCallback, ProxyResult } from 'aws-lambda';
import { HttpError } from './Errors/HttpError';
import { Buffer } from 'buffer';
import { print_debug } from './Utilities/Functions';
import { CookieOptions } from './CookieOptions';

declare const process:any;

export class Response implements ProxyResult {

    constructor (protected callback: ProxyCallback) {}

    public statusCode:number = 200;
    public headers:{ [key: string] : string } = {};
    public body:string = null;

    protected _sent: boolean = undefined;

    /**
     * Indicate whatever the response has been sent.
     * @return {boolean} [description]
     */
    public get sent(): boolean {
        return this._sent;
    }

    /**
     * Set the status code of the response. Defaults to 200.
     * @type {number}
     * @return {this}
     */
    public setStatusCode(status: number): this {
        this.statusCode = status;
        return this;
    }

    /**
     * Add a header to this response.
     * @param  {string} key
     * @param  {string} value
     * @return {this}
     */
    public addHeader(key:string, value:string): this {
        this.headers[key.toLowerCase()] = value;
        return this;
    }

    /**
     * Add a multiple headers to the response
     * @param  { [key: string] : string } } headers
     * @return {this}
     */
    public addHeaders(headers: { [key: string] : string }): this {
        for(let key in headers) {
            this.addHeader(key, headers[key]);
        }
        return this;
    }

    /**
     * Remove a header from the response.
     * @param  {string} key
     * @return {this}
     */
    public removeHeader(key: string): this {
        if (this.headers[key] != undefined ) {
            delete this.headers[key];
        }
        return this;
    }

    /**
     * Set a cookie on this response. Because of a quirk in the way API Gateway Proxy Integration and Lambda work, only
     * one cookie can be set per response. Calling addCookie multiple time on the same response object will override
     * the previously set cookie.
     * @param {string} key     Key-name for the cookie.
     * @param {string} value   Value to assign to the cookie.
     * @param {CookieOptions} options Optional parameter that can be use to define additional option for the cookie.
     */
    public addCookie(key: string, value: string, options: CookieOptions = {}): this {
        const defaults = {
            secure: true,
            httpOnly: true,
            path: '/',
        }
        if (typeof options == 'object') {
            options = Object.assign({}, defaults, options);
        } else {
            options = defaults;
        }

        let cookie = `${key}=${value}`;

        if (options.domain) {
            cookie += '; domain=' + options.domain;
        }

        if (options.path) {
            cookie += '; path=' + options.path;
        }

        // If the `expires` attribute is unset and the `maxAge` attribute is.
        if (!options.expires && options.maxAge) {
            // Build a Date Object a specified number of second in the future.
            options.expires = new Date(new Date().getTime() + options.maxAge * 1000); // JS operate in Milli-seconds
        }

        // if Expires at is a Date object, convert it to a string.
        if (typeof options.expires == "object" && typeof options.expires.toUTCString == 'function') {
            options.expires = options.expires.toUTCString();
        }

        if (options.expires) {
            cookie = cookie + '; expires=' + options.expires.toString();
        }

        if (options.secure) {
            cookie = cookie + '; Secure';
        }

        if (options.httpOnly) {
            cookie = cookie + '; HttpOnly';
        }

        return this.addHeader('set-cookie', cookie);
    }

    /**
     * Receives something and try to convert it to a string for hte body.
     * @param  {any}  body [description]
     * @return {this}      [description]
     */
    public setBody(body: any): this {
        const type: string = typeof body;
        switch (type) {
            case 'undefined':
                this.body = null;
                break;
            case 'string':
                this.body = body;
                break;
            case 'array':
            case 'object':
                if (body instanceof Buffer) {
                    this.body = body.toString('utf-8');
                } else if (body === null) {
                    this.body = null;
                } else {
                    this.body = JSON.stringify(body);
                }
                break;
            default:
                this.body = body.toString();
        }

        return this;
    }

    /**
     * Send the resonse back to the client.
     */
    public send(): void {
        if (this.sent) {
            throw new Error('Response has already been sent.');
        }

        this.callback(null, this);
        this._sent = true;
    }

    /**
     * Sends a response that should cause clients to navigate to the provided URL.
     * @param {string} url [description]
     */
    public redirect(url: string): void {
        this.addHeader('location', url).setStatusCode(302).setBody("").send();
    }

    /**
     * Send a failed response to the client. This method can be used to send both expected and unexpected errors.
     *
     * If the execution of your handler terminates via an expected exception (e.g: a user doesn't have the right to
     * access a ressource or the resource doesn't exists), you can use this method to return a meaningfull HTTP error
     * to the client. To do this provide an error object with a truty `passthrough` property, a `statusCode` property
     * and an optional `body` property. If you handler is termiated this way, Lambda consider that your function as
     * completed sucessfully.
     *
     * If you catch an unexpected error and pass it to this method, the handler will be terminate via Lambda's error
     * callback. This will show up as a failed execution in your Lambda error logs and the client will recieved a 500
     * Server Error response.
     * @param {any} error
     */
    public fail(error:any): void {
        print_debug(error);

        if (this.sent) {
            throw new Error('Response has already been sent.');
        }

        if (error.passthrough) {
            this.statusCode = error.statusCode;
            this.setBody(error.body ? error.body : null);
            this.callback(null, this);
        } else {
            this.callback(error);
        }

        this._sent = true;
    }

}
