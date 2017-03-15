import { AbstractHandler } from './AbstractHandler';
import * as AWS from 'aws-sdk';
import { Request } from '../Request';
import { InternalServerError } from '../Errors';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { QueuingHandlerConfig } from '../Config';
import { LAMBDA_FN_ATTR } from './ProcessQueueHandler';

/**
 * Get an event store to a queue with a schedule function to run it.
 */
export class QueuingHandler extends AbstractHandler {

    protected arn:SQSQueueARN;

    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {string}                    lambdaFn Lambda function that will be used to process the message. This will
     *                                              be stored as an attribute on the message. If left blank, no
     *                                              attribute will be stored and the processing method will need to be
     *                                              define manually.
     * @param  {HandlerConfig}              config
     */
    constructor(arn: AmazonResourceName|string, protected config:QueuingHandlerConfig = {}) {
        super(config);
        this.arn = SQSQueueARN.normalize(arn);
    }

    public process(request:Request, response:Response): Promise<void> {
        return this.validateRequest(request).then((storeInQueue: boolean) => {
            // If we are to store the evetn in a queue
            if (storeInQueue) {
                // Send request to SQS
                let param = this.buildSQSmessage();
                let sqs = new AWS.SQS;
                return sqs.sendMessage(param)
                    .promise()
                    .then((data: AWS.SQS.SendMessageResult) => {
                        // Send a SNS notification
                        return this.publishToSNS(data)
                            .then(() => data); // Once the notification, pass along the SQS message reference
                    });
            } else {
                // There's no message to queue, so lets not do anything.
                return Promise.resolve(null);
            }
        })
        .then((data: AWS.SQS.SendMessageResult) => {
            return this.sendResponse(response, data);
        })
    }

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
    protected validateRequest(request: Request): Promise<boolean> {
        return Promise.resolve(true);
    }

    /**
     * Build the message that will be sent to SQS.
     * @return {AWS.SQS.SendMessageRequest} [description]
     */
    protected buildSQSmessage(): AWS.SQS.SendMessageRequest {
        const param: AWS.SQS.SendMessageRequest = {
            MessageBody: JSON.stringify(this.request.data),
            QueueUrl: this.arn.url()
        }

        if (this.config.lambdaFn) {
            param.MessageAttributes = {
                "lambdaFn": {
                    DataType: "String",
                    StringValue: this.config.lambdaFn
                }
            }
        }

        return param
    }

    /**
     * Publish a notification to an SNS Topic once the event has been added to the Queue.
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {Promise<any>}                      [description]
     */
    protected publishToSNS(sqsData: AWS.SQS.SendMessageResult): Promise<any> {
        if (this.config.notifySNSTopic) {
            // Build our SNS publish params.
            const params: AWS.SNS.PublishInput = this.buildSNSMessage(
                AmazonResourceName.normalize(this.config.notifySNSTopic),
                sqsData
            );

            // Send the message
            const sns = new AWS.SNS;
            return sns.publish(params).promise();

        } else {
            // Config says not to publish to SNS
            return Promise.resolve();
        }
    }

    /**
     * Build a message to publish to an SNS topic. The default behavior is to send stringify the event. Child class can
     * override this method to customize the message
     * @param  {AmazonResourceName}        arn     [description]
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {AWS.SNS.PublishInput}              [description]
     */
    protected buildSNSMessage(arn: AmazonResourceName, sqsData: AWS.SQS.SendMessageResult): AWS.SNS.PublishInput {
        return {
            Message: JSON.stringify(this.request.data),
            Subject: `Message ID ${sqsData.MessageId} added to Queue`,
            TopicArn: arn.toString()
        }
    }

    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}                       response
     * @param  {AWS.SQS.SendMessageResult}      data The response from SQS. This may be null, if the message was not
     *                                               sent away.
     * @return {Promise<void>}
     */
    protected sendResponse(response: Response, data: AWS.SQS.SendMessageResult = null): Promise<void> {
        response.send();
        return Promise.resolve();
    }

}
