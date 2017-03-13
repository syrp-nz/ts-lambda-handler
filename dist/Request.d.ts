import { APIGatewayEvent } from 'aws-lambda';
export declare class Request {
    protected event: APIGatewayEvent;
    constructor(event: APIGatewayEvent);
    readonly data: APIGatewayEvent;
    /**
     * Lower case all the keys in the provided list.
     * @param {[key:string]: string}
     */
    protected normalizeKeys(list: {
        [key: string]: string;
    }): void;
    /**
     * Retrieve the a header value if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    getHeader(key: string, defaultVal?: string): string;
    /**
     * Retrieve the method for this request.
     */
    getMethod(): string;
    /**
     * Retrieve a query string parameter if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    getQueryStringParameter(key: string, defaultVal?: string): string;
    /**
     * Retrieve a path parameter if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    getPathParameter(key: string, defaultVal?: string): string;
    /**
     * Retrieve a stage variable if it exists. The key for is case sensitive for this function unlike the other get
     * functions.
     * @param  {string}    key  Case sensitive key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    getStageVariable(key: string, defaultVal?: string): string;
    getResourceId(): string;
    /**
     * Retrieve a specific value from an array or return a default value.
     * @param  {[key:string]: string}    list
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    protected getValue(list: {
        [key: string]: string;
    }, key: string, defaultVal: string): string;
    /**
     * Retrieve the content-type of this request as defined by the content-type header.
     * @return {string}
     */
    getContentType(): string;
    /**
     * Return the request origin's as defined by the origin header.
     * @return {string} [description]
     */
    getOrigin(): string;
    /**
     * Return the request origin's domain.
     * @return {string} [description]
     */
    getOriginDomain(): string;
    /**
     * Return the protocol of the Request Origin.
     * @return {string} [description]
     */
    getOriginProtocol(): string;
    /**
     * Attempt to parse the body content has defined by the content type header
     * @return {any}
     */
    getParseBody(): any;
    /**
     * Attempt to parse the request body as JSON.
     * @return {any}
     */
    getBodyAsJSON(): any;
}
