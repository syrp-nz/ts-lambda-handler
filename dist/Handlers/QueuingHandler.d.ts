import { AbstractHandler } from './AbstractHandler';
import * as AWS from 'aws-sdk';
import { Request } from '../Request';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { QueuingHandlerConfig } from '../Config';
/**
 * Get an event store to a queue with a schedule function to run it.
 */
export declare class QueuingHandler extends AbstractHandler {
    protected config: QueuingHandlerConfig;
    protected arn: SQSQueueARN;
    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {string}                    lambdaFn Lambda function that will be used to process the message. This will
     *                                              be stored as an attribute on the message. If left blank, no
     *                                              attribute will be stored and the processing method will need to be
     *                                              define manually.
     * @param  {HandlerConfig}              config
     */
    constructor(arn: AmazonResourceName | string, config?: QueuingHandlerConfig);
    process(request: Request, response: Response): Promise<void>;
    /**
     * You can override this method if the event needs validated in some way before being stored in a queue.
     * If the Promise returns true, the event will be queue. If the Promise returns false, the event will not be store,
     * but we will still response to the webhook with a 200 OK.
     *
     * If an error needs to be reported to the client, reject the promise with a suitable HttpError.
     *
     * If the method is not overriden, the event will systematically be stored in the queue.
     *
     * @return {Promise<void>} [description]
     */
    protected validateRequest(request: Request): Promise<boolean>;
    /**
     * Build the message that will be sent to SQS.
     * @return {AWS.SQS.SendMessageRequest} [description]
     */
    protected buildSQSmessage(): AWS.SQS.SendMessageRequest;
    /**
     * Publish a notification to an SNS Topic once the event has been added to the Queue.
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {Promise<any>}                      [description]
     */
    protected publishToSNS(sqsData: AWS.SQS.SendMessageResult): Promise<any>;
    /**
     * Build a message to publish to an SNS topic. The default behavior is to send stringify the event. Child class can
     * override this method to customize the message
     * @param  {AmazonResourceName}        arn     [description]
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {AWS.SNS.PublishInput}              [description]
     */
    protected buildSNSMessage(arn: AmazonResourceName, sqsData: AWS.SQS.SendMessageResult): AWS.SNS.PublishInput;
    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}                       response
     * @param  {AWS.SQS.SendMessageResult}      data The response from SQS. This may be null, if the message was not
     *                                               sent away.
     * @return {Promise<void>}
     */
    protected sendResponse(response: Response, data?: AWS.SQS.SendMessageResult): Promise<void>;
}
