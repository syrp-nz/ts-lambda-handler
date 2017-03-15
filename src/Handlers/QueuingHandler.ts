import { AbstractHandler } from './AbstractHandler';
import * as AWS from 'aws-sdk';
import { Request } from '../Request';
import { InternalServerError } from '../Errors';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { HandlerConfig } from '../Config';
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
    constructor(arn: AmazonResourceName|string, protected lambdaFn:string = '', config:HandlerConfig = {}) {
        super(config);
        this.arn = SQSQueueARN.normalize(arn);
    }

    public process(request:Request, response:Response): Promise<void> {
        return this.validateRequest(request).then(() => {
            // Build our message
            let param: AWS.SQS.SendMessageRequest = {
                MessageBody: JSON.stringify(request.data),
                QueueUrl: this.arn.url()
            }

            if (this.lambdaFn) {
                param.MessageAttributes = {
                    "lambdaFn": {
                        DataType: "String",
                        StringValue: this.lambdaFn
                    }
                }
            }

            // Set up the message request.
            let sqs = new AWS.SQS;
            return sqs.sendMessage(param).promise();
        }).then((data: AWS.SQS.SendMessageResult) => {
            this.sendResponse(response);
        })
    }

    /**
     * You can override this method if the event needs validated in some way before being stored in a queue. If the
     * event is invalid, this method should return a rejected promise with an suitable HttpError.
     *
     * If the method is not overriden, the event will systematically be stored in the queue.
     *
     * @return {Promise<void>} [description]
     */
    protected validateRequest(request: Request): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}      response
     * @return {Promise<void>}
     */
    protected sendResponse(response: Response): Promise<void> {
        response.send();
        return Promise.resolve();
    }

}
