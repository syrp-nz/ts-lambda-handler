import { ProxyHandler, APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { Request } from '../Request';
import { Response } from '../Response';
import { HttpError } from '../Errors/HttpError';
import { HandlerConfig } from '../Config/HandlerConfig';
import { CorsPolicy } from '../Config/CorsPolicy';


/**
 * Basic implementation of the Handler class. This is meant to provide an abstraction of an AWS request to facilitate the implementation of a Lambda function for a AWS Proxy request.
 */
export abstract class AbstractHandler {

    protected request: Request;
    protected response: Response;
    protected context: Context;
    protected callback: ProxyCallback;

    /**
     * Flag to confirm the init method has been called.
     * @type {boolean}
     */
    private isInit: boolean = false;

    constructor(protected config:HandlerConfig = {}) {}

    /**
     * Initialize the handler object. This method is called before the `process` method. You may override it for your own purpose, but make sure you call the parent method.
     * @param  {APIGatewayEvent} event
     * @param  {Context}         context
     * @param  {ProxyCallback}   callback
     */
    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): void {
        this.request = new Request(event);
        this.response = new Response(callback);

        if (this.config.cors) {
            const corsPolicy = new CorsPolicy(this.config.cors);
            const corsHeaders = corsPolicy.headers(this.request);
            this.response.addHeaders(corsHeaders);
        }

        // Confirm the handler has been Initialize
        this.isInit = true;
    }

    /**
     * Proxy Handler method to you provide to AWS.
     * @type {ProxyHandler}
     */
    public handle: ProxyHandler = (event: APIGatewayEvent, context: Context, callback: ProxyCallback) => {
        try {
            this.init(event, context, callback);
            console.assert(this.isInit, 'Non-initialize Handler. Overridden init method on extended Handler must call parent.');

            this.process(this.request, this.response);
        } catch (error) {
            this.response.fail(error);
        }
    }

    /**
     * This method is where you implement your specific logic. Somewhere in your method, you must call the `send` method on the `response` object.
     * @param {Request}  request
     * @param {Response} response
     */
    public abstract process(request: Request, response: Response): void;
}
