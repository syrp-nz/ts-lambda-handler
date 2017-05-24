import { ProxyCallback, ProxyResult } from 'aws-lambda';
import { CookieOptions } from './CookieOptions';
export declare class Response implements ProxyResult {
    protected callback: ProxyCallback;
    constructor(callback: ProxyCallback);
    statusCode: number;
    headers: {
        [key: string]: string;
    };
    body: string;
    protected _sent: boolean;
    /**
     * Indicate whatever the response has been sent.
     * @return {boolean} [description]
     */
    readonly sent: boolean;
    /**
     * Set the status code of the response. Defaults to 200.
     * @type {number}
     * @return {this}
     */
    setStatusCode(status: number): this;
    /**
     * Add a header to this response.
     * @param  {string} key
     * @param  {string} value
     * @return {this}
     */
    addHeader(key: string, value: string): this;
    /**
     * Add a multiple headers to the response
     * @param  { [key: string] : string } } headers
     * @return {this}
     */
    addHeaders(headers: {
        [key: string]: string;
    }): this;
    /**
     * Set the `cache-control` header. If the `seconds` is greater than zero, it will set the max age flag. Smaller values will set the header to `no-cache`.
     * @param  {number} value
     */
    setMaxAge(seconds: number): this;
    /**
     * Remove a header from the response.
     * @param  {string} key
     * @return {this}
     */
    removeHeader(key: string): this;
    /**
     * Set a cookie on this response. Because of a quirk in the way API Gateway Proxy Integration and Lambda work, only
     * one cookie can be set per response. Calling addCookie multiple time on the same response object will override
     * the previously set cookie.
     * @param {string} key     Key-name for the cookie.
     * @param {string} value   Value to assign to the cookie.
     * @param {CookieOptions} options Optional parameter that can be use to define additional option for the cookie.
     */
    addCookie(key: string, value: string, options?: CookieOptions): this;
    /**
     * Receives something and try to convert it to a string for hte body.
     * @param  {any}  body [description]
     * @return {this}      [description]
     */
    setBody(body: any): this;
    /**
     * Send the resonse back to the client.
     */
    send(): void;
    /**
     * Sends a response that should cause clients to navigate to the provided URL.
     * @param {string} url [description]
     */
    redirect(url: string): void;
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
    fail(error: any): void;
}
