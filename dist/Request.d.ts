import { APIGatewayEvent } from 'aws-lambda';
import * as JOI from 'joi';
import { HttpVerb } from './Types';
/**
 * Abstract an AWS APIGatewayEvent object. `Request` provides various utility methods to
 * * read query string parameters or header values in a case insensitive way ;
 * * validate query string parameters ;
 * * Read common request data like the origin domain, content-type header ;
 * * Parse request body to sensible object.
 */
export declare class Request {
    protected event: APIGatewayEvent;
    /**
     * Contains the original event data without any of the normalisation.
     */
    protected originalEvent: APIGatewayEvent;
    /**
     * Initialize the request from a APIGatewayEvent.
     * @param  {APIGatewayEvent} event APIGatewayEvent received from AWS Lambda
     */
    constructor(event: APIGatewayEvent);
    /**
     * Event data received from AWS Lambda. The keys of some parameters will have been lowercase to make it easier to
     * search for specific entries in a case insensitive way.
     */
    readonly data: APIGatewayEvent;
    /**
     * Raw event data received from AWS Lambda.
     */
    readonly originalData: APIGatewayEvent;
    /**
     * Lower case all the keys in the provided list.
     * @param {[key:string]: string}
     */
    protected normalizeKeys(list: {
        [key: string]: string;
    }): void;
    /**
     * Retrieve a header value if it exists.
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @return {string}
     */
    getHeader(key: string, defaultVal?: string): string;
    /**
     * Retrieve the method used to initiate this request.
     */
    getMethod(): HttpVerb;
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
    /**
     * Retrieve a resource ID path parameter. Assumes that path parameter name is _id_.
     * @todo Need to rethink this method.
     * @deprecated
     * @return {string} [description]
     */
    getResourceId(): string;
    /**
     * Retrieve a specific value from an array or return a default value.
     * @param  {[key:string]: string}    list
     * @param  {string}    key  Case Insensitive header key
     * @param  {string}    defaultVal Value to return if that header is undefined.
     * @param  {boolean}   lcKey Whatever the key should be lowercase before trying to find the value.
     * @return {string}
     */
    protected getValue(list: {
        [key: string]: string;
    }, key: string, defaultVal: string, lcKey?: boolean): string;
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
     * @param   {string}    type    Optional parameter to explicitely define the MIME type to use when parsing the body.
     * @return {any}
     */
    getParseBody(type?: string): any;
    /**
     * Attempt to parse the request body as JSON.
     * @throws BadRequestError
     * @return {any}
     */
    getBodyAsJSON(): any;
    /**
     * Validate the Query string parameter using the provided shcema. If the validation passes, a void promise is
     * return. Otherwise the promise is rejected with an appropriate HTTP error
     * @param  {JOI.SchemaMap} schema
     * @return {Promise<void>}
     */
    validateQueryString(schema: JOI.SchemaMap): Promise<void>;
}
