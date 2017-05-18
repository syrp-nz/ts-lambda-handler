import { ProxyHandler, APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { Request } from '../Request';
import { Response } from '../Response';
import { HandlerConfig } from '../Config/HandlerConfig';
import { UserInterface } from '../Authorizers/UserInterface';
/**
 * Basic implementation of the Handler class. This is meant to provide an abstraction of an AWS request to facilitate the implementation of a Lambda function for a AWS Proxy request.
 */
export declare abstract class AbstractHandler {
    protected config: HandlerConfig;
    protected request: Request;
    protected response: Response;
    protected context: Context;
    protected callback: ProxyCallback;
    protected user: UserInterface;
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
    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): Promise<void>;
    /**
     * Decrypt some environement variables as specified in the COnfiguration for the Handler
     * @return {Promise<void>} [description]
     */
    protected decryptEnvVarsFromConfig(): Promise<void>;
    /**
     * Determine if the current user can perform the current request. Return a promise that will return true if there's
     * a valid authorizer assigned to this handler or false if there's no authorizer define for this handler.
     *
     * Invalid credentials will be handle via Promise rejection.
     * @return {Promise<boolean>} [description]
     */
    protected authorize(): Promise<boolean>;
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
    abstract process(request: Request, response: Response): Promise<void>;
    protected errorHandler(error: any): void;
}
