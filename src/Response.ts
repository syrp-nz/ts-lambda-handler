import { ProxyCallback, ProxyResult } from 'aws-lambda';
import { HttpError } from './Errors/HttpError';

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

    public setBody(body: any): this {
        const type: string = typeof body;
        switch (type) {
            case 'null':
            case 'undefined':
                this.body = null;
                break;
            case 'string':
                this.body = body;
                break;
            default:
                this.body = JSON.stringify(body);
                break;
        }

        return this;
    }


    public send(): void {
        this.callback(null, this);
    }

    public fail(error: Error): void {
        if (error instanceof HttpError) {
            const httpError = <HttpError>error;
            this.statusCode = httpError.statusCode;
            this.setBody(httpError.body());
            this.send();
        } else {
            this.callback(error);
        }
    }

}
