import { ProxyCallback, ProxyResult } from 'aws-lambda';
import { HttpError } from './Errors/HttpError';
import { Buffer } from 'buffer';
import { print_debug } from './Utilities/Functions';

declare const process:any;

export class Response implements ProxyResult {

    constructor (protected callback: ProxyCallback) {}

    public statusCode:number = 200;
    public headers:{ [key: string] : string } = {};
    public body:string = null;

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
        this.headers[key] = value;
        return this;
    }

    /**
     * Add a multiple headers to the response
     * @param  { [key: string] : string } } headers
     * @return {this}
     */
    public addHeaders(headers: { [key: string] : string }): this {
        Object.assign(this.headers, headers);
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


    public send(): void {
        this.callback(null, this);
    }

    public fail(error): void {
        print_debug(error);
        if (error.statusCode != undefined) {
            this.statusCode = error.statusCode;
            this.setBody(error.body ? error.body : null);
            this.send();
        } else {
            this.callback(error);
        }
    }

}
