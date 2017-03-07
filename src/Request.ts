import {APIGatewayEvent} from 'aws-lambda';
import Url = require('url');

export class Request {

    constructor(protected event: APIGatewayEvent) {
        this.normalizeKeys(this.event.headers);
        this.normalizeKeys(this.event.queryStringParameters);
        this.normalizeKeys(this.event.pathParameters);
    }

    public get data(): APIGatewayEvent {
        return this.event;
    }

    /**
     * Lower case all the keys in the provided list.
     * @param {[key:string]: string}
     */
    protected normalizeKeys(list: {[key:string]: string}): void {
        for (let key in list) {
            let value = list[key];
            delete list[key];
            list[key.toLowerCase()] = value;
        }
    }

    /**
     * Retrieve the a header value if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    public getHeader(key: string, defaultVal: string = ''): string {
        return this.getValue(this.event.headers, key, defaultVal);
    }

    /**
     * Retrieve the method for this request.
     */
    public getMethod(): string {
        return this.event.httpMethod.toUpperCase();
    }

    /**
     * Retrieve a query string parameter if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    public getQueryStringParameter(key: string, defaultVal: string = ''): string {
        return this.getValue(this.event.queryStringParameters, key, defaultVal);
    }

    /**
     * Retrieve a path parameter if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    public getPathParameter(key: string, defaultVal: string = ''): string {
        return this.getValue(this.event.pathParameters, key, defaultVal);
    }

    public getResourceId(): string {
        return this.getPathParameter('id');
    }

    /**
     * Retrieve a specific value from an array or return a default value.
     * @param  {[key:string]: string}    list
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    protected getValue(list: {[key:string]: string}, key: string, defaultVal: string): string {
        key = key.toLowerCase();
        if (list && list[key] != undefined) {
            return list[key];
        } else {
            return defaultVal;
        }
    }

    /**
     * Retrieve the content-type of this request as defined by the content-type header.
     * @return {string}
     */
    public getContentType(): string {
        return this.getHeader('content-type');
    }

    /**
     * Return the request origin's as defined by the origin header.
     * @return {string} [description]
     */
    public getOrigin(): string {
        return this.getHeader('origin');
    }

    /**
     * Return the request origin's domain.
     * @return {string} [description]
     */
    public getOriginDomain(): string {
        const origin = this.getOrigin();
        if (origin) {
            const url = Url.parse(origin);
            if (url.hostname) {
                return url.hostname;
            }
        }

        return '';
    }

    /**
     * Return the protocol of the Request Origin.
     * @return {string} [description]
     */
    public getOriginProtocol(): string {
        const origin = this.getOrigin();
        if (origin) {
            const url = Url.parse(origin);
            if (url.protocol) {
                return url.protocol.replace(/:$/, '');
            }
        }

        return '';
    }

    /**
     * Attempt to parse the body content has defined by the content type header
     * @return {any}
     */
    public getParseBody():any {
        let parseBody:any = null;

        switch (this.getContentType()) {
            case 'text/json':
            case 'text/x-json':
            case 'application/json':
                parseBody = this.getBodyAsJSON();
                break;

            case 'text/plain':
            default:
                return this.event.body;
        }

        return parseBody;
    }

    /**
     * Attempt to parse the request body as JSON.
     * @return {any}
     */
    public getBodyAsJSON(): any {
        return JSON.parse(this.event.body);
    }

}
