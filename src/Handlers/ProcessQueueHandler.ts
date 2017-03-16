import { AbstractHandler } from './AbstractHandler';
import * as AWS from 'aws-sdk';
import { Request } from '../Request';
import { InternalServerError } from '../Errors';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { isInTestingMode} from '../Utilities/Functions';
import { ProcessQueueHandlerConfig } from '../Config';
import { Map } from '../Map';
import { validateLambdaInvokeResponse } from '../Utilities/Functions';

export const LAMBDA_FN_ATTR = 'lambdaFn';

/**
 * Read messages from an SQS Queue and attempt to process them with Lambda functions.
 */
export class ProcessQueueHandler extends AbstractHandler {



    protected arn:SQSQueueARN;

    protected jobErrors:Map<any> = {};
    protected jobSuccesses:Map<AWS.Lambda.InvocationResponse> = {};

    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {ProcessQueueHandlerConfig} config
     */
    constructor(
        arn: AmazonResourceName|string,
        protected config:ProcessQueueHandlerConfig = {}
    ) {
        super(config);
        this.arn = SQSQueueARN.normalize(arn);
    }

    public process(request:Request, response:Response): Promise<void> {
        return this.readMessages()
            .then((data) => this.processMessages(data))
            .then(() => {
                // Log errors if there's any. We suppress the output when running unit test.
                if (Object.keys(this.jobErrors).length > 0 && !isInTestingMode()) {
                    console.error(this.jobErrors);
                }

                // Return the error and success counts
                response.setBody({
                    errorCount: Object.keys(this.jobErrors).length,
                    successCount: Object.keys(this.jobSuccesses).length
                }).send();

                return Promise.resolve();
            });
    }

    /**
     * Read messages from the queue
     * @return {Promise<AWS.SQS.ReceiveMessageRequest>}
     */
    protected readMessages(): Promise<AWS.SQS.ReceiveMessageResult> {
        let params:AWS.SQS.ReceiveMessageRequest = {
            QueueUrl: this.arn.url()
        };

        // If we don't explicitely define a lambda function to call, fet the lambdaFn attribute from the Queue.
        if (this.config.lambdaFn == undefined || this.config.lambdaFn == '' ) {
            params.MessageAttributeNames = [LAMBDA_FN_ATTR];
        }

        // If we explicitely ask for a number of message to retrieve
        if (this.config.messageNumber && this.config.messageNumber > 0) {
            params.MaxNumberOfMessages = this.config.messageNumber;
        }

        // If we set a visibility timeout on the queue.
        if (this.config.visibilityTimeout && this.config.visibilityTimeout > 0) {
            params.VisibilityTimeout = this.config.visibilityTimeout;
        }

        let sqs = new AWS.SQS;
        return sqs.receiveMessage(params).promise();
    }

    /**
     * Given a list of SQS message, launch a bunch of Lambda function to process them.
     * @param  {AWS.SQS.ReceiveMessageResult} data [description]
     * @return {Promise<any>}                      [description]
     */
    protected processMessages(data: AWS.SQS.ReceiveMessageResult): Promise<any> {
        // There's no message in the queue.
        if (!data.Messages || data.Messages.length == 0) {
            return Promise.resolve();
        }

        const promises: Promise<any>[] = [];

        // Loop over the SQS message
        for (let msg of data.Messages) {
            promises.push(
                this.invoke(msg)
                    .then((data: AWS.Lambda.InvocationResponse) => this.readInvocationResponse(data, msg.MessageId))
                    .then(() => this.removeMessageFromQueue(msg.ReceiptHandle))
                    .catch((error) => this.readInvocationError(error, msg.MessageId))
            );
        }

        // Wait for all the invocation to resolve.
        return Promise.all(promises);
    }

    /**
     * Given an SQS function, fires an AWS Lambda function to process it.
     * @param  {AWS.SQS.Message}                        msg
     * @return {Promise<AWS.Lambda.InvocationResponse>}
     */
    protected invoke(msg: AWS.SQS.Message): Promise<AWS.Lambda.InvocationResponse> {
        let fnName = this.config.lambdaFnPrefix ?
            this.config.lambdaFnPrefix :
            '';

        if (this.config.lambdaFn && this.config.lambdaFn != '') {
            fnName += this.config.lambdaFn;
        } else if (msg.MessageAttributes && msg.MessageAttributes[LAMBDA_FN_ATTR]) {
            fnName += msg.MessageAttributes[LAMBDA_FN_ATTR].StringValue;
        } else {
            return Promise.reject(new Error('No function defined for processing Message ID ' + msg.MessageId));
        }

        let params: AWS.Lambda.InvocationRequest = {
            FunctionName: fnName,
            InvocationType: 'RequestResponse',
            Payload: msg.Body
        };

        let lambda = new AWS.Lambda;
        return lambda.invoke(params).promise();
    }

    /**
     * Read the response from an invocation and determine if it's a success or a failure.
     * @param  {AWS.Lambda.InvocationResponse} data [description]
     * @return {Promise<void>}                   [description]
     */
    protected readInvocationResponse(data: AWS.Lambda.InvocationResponse, messageId:string): Promise<void> {
        if (validateLambdaInvokeResponse(data)) {
            this.jobSuccesses[messageId] = data;
            return Promise.resolve();
        } else {
            return Promise.reject(data);
        }
    }

    /**
     * Remove a message from a SQS queue
     * @param  {string}       receitHandle Receipt handle that will have been provided when the message was fetched.
     * @return {Promise<any>}
     */
    protected removeMessageFromQueue(receitHandle:string): Promise<any> {
        let sqs = new AWS.SQS;
        return sqs.deleteMessage({
            QueueUrl: this.arn.url(),
            ReceiptHandle: receitHandle
        }).promise();
    }


    /**
     * Catch an invocation error
     * @param  {[type]}        error [description]
     * @return {Promise<void>}       [description]
     */
    protected readInvocationError(error, messageId): Promise<void> {
        this.jobErrors[messageId] = error;
        return Promise.resolve();
    }
}
