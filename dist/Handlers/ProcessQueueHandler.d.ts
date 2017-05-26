import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { AbstractHandler } from './AbstractHandler';
import * as AWS from 'aws-sdk';
import { Request } from '../Request';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { ProcessQueueHandlerConfig } from '../Config';
import { ObjectMap } from '../Types';
export declare const LAMBDA_FN_ATTR = "lambdaFn";
/**
 * Read messages from an SQS Queue and attempt to process them with Lambda functions.
 */
export declare class ProcessQueueHandler extends AbstractHandler {
    protected config: ProcessQueueHandlerConfig;
    protected arn: SQSQueueARN;
    protected jobErrors: ObjectMap<any>;
    protected jobSuccesses: ObjectMap<AWS.Lambda.InvocationResponse>;
    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {ProcessQueueHandlerConfig} config
     */
    constructor(arn: AmazonResourceName | string, config?: ProcessQueueHandlerConfig);
    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): Promise<void>;
    process(request: Request, response: Response): Promise<void>;
    /**
     * Read messages from the queue
     * @return {Promise<AWS.SQS.ReceiveMessageRequest>}
     */
    protected readMessages(): Promise<AWS.SQS.ReceiveMessageResult>;
    /**
     * Given a list of SQS message, launch a bunch of Lambda function to process them.
     * @param  {AWS.SQS.ReceiveMessageResult} data [description]
     * @return {Promise<any>}                      [description]
     */
    protected processMessages(data: AWS.SQS.ReceiveMessageResult): Promise<any>;
    /**
     * Given an SQS function, fires an AWS Lambda function to process it.
     * @param  {AWS.SQS.Message}                        msg
     * @return {Promise<AWS.Lambda.InvocationResponse>}
     */
    protected invoke(msg: AWS.SQS.Message): Promise<AWS.Lambda.InvocationResponse>;
    /**
     * Read the response from an invocation and determine if it's a success or a failure.
     * @param  {AWS.Lambda.InvocationResponse} data [description]
     * @return {Promise<void>}                   [description]
     */
    protected readInvocationResponse(data: AWS.Lambda.InvocationResponse, messageId: string): Promise<void>;
    /**
     * Remove a message from a SQS queue
     * @param  {string}       receitHandle Receipt handle that will have been provided when the message was fetched.
     * @return {Promise<any>}
     */
    protected removeMessageFromQueue(receitHandle: string): Promise<any>;
    /**
     * Catch an invocation error
     * @param  {[type]}        error [description]
     * @return {Promise<void>}       [description]
     */
    protected readInvocationError(error: any, messageId: any): Promise<void>;
}
