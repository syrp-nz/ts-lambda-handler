import { ProxyCallback, ProxyResult } from 'aws-lambda';
export declare class Response implements ProxyResult {
    protected callback: ProxyCallback;
    constructor(callback: ProxyCallback);
    statusCode: number;
    headers: {
        [key: string]: string;
    };
    body: string;
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
     * Remove a header from the response.
     * @param  {string} key
     * @return {this}
     */
    removeHeader(key: string): this;
    setBody(body: any): this;
    send(): void;
    fail(error: Error): void;
}
