import { ProxyHandler, APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { Request } from '../Request';
import { Response } from '../Response';
import { HandlerConfig } from '../Config/HandlerConfig';
/**
 * Basic implementation of the Handler class. This is meant to provide an abstraction of an AWS request to facilitate the implementation of a Lambda function for a AWS Proxy request.
 */
export declare abstract class AbstractHandler {
    protected config: HandlerConfig;
    protected request: Request;
    protected response: Response;
    protected context: Context;
    protected callback: ProxyCallback;
    /**
     * Flag to confirm the init method has been called.
     * @type {boolean}
     */
    private isInit;
    constructor(config?: HandlerConfig);
    /**
     * Initialize the handler object. This method is called before the `process` method. You may override it for your own purpose, but make sure you call the parent method.
     * @param  {APIGatewayEvent} event
     * @param  {Context}         context
     * @param  {ProxyCallback}   callback
     */
    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): void;
    /**
     * Proxy Handler method to you provide to AWS.
     * @type {ProxyHandler}
     */
    handle: ProxyHandler;
    /**
     * This method is where you implement your specific logic. Somewhere in your method, you must call the `send` method on the `response` object.
     * @param {Request}  request
     * @param {Response} response
     */
    abstract process(request: Request, response: Response): void;
}
