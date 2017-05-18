import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as Lambda from 'aws-lambda';
import { fakeEvent } from '../FakeEvent';
import * as MOCKAWS from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import * as MockContext from 'aws-lambda-mock-context';

declare const process;

const assert = chai.assert;
const queue = new Lib.Utilities.SQSQueueARN('arn:aws:sqs:us-west-2:123456789:QueueName');
const fnName = 'someLambdaFunctionName';

const mockLambda = (params: AWS.Lambda.InvocationRequest, callback) => {
    switch (params.FunctionName) {
        case 'Succeed':
            callback(null, {StatusCode: 200});
            break;
        case 'FailMe':
            callback(null, {StatusCode: 200, FunctionError: 'Handled'});
            break;
        case 'IDontExist':
            callback(null, {StatusCode: 400});
            break;
        case '':
        case undefined:
        default:
            assert(false, 'Invalid/Unexpected function name');
            break;
    }
};

const sqsMessages: AWS.SQS.ReceiveMessageResult = {
    Messages: [
        {
            MessageId: 'abc1',
            ReceiptHandle: 'abc1-1',
            Body: 'hello world',
            MessageAttributes: {
                'lambdaFn': {
                    StringValue: 'Succeed',
                    DataType: 'String'
                }
            }
        },
        {
            MessageId: 'abc2',
            ReceiptHandle: 'abc2-1',
            Body: 'hello world',
            MessageAttributes: {
                'lambdaFn': {
                    StringValue: 'FailMe',
                    DataType: 'String'
                }
            }
        },
        {
            MessageId: 'abc3',
            ReceiptHandle: 'abc3-1',
            Body: 'hello world',
            MessageAttributes: {
                'lambdaFn': {
                    StringValue: 'IDontExist',
                    DataType: 'String'
                }
            }
        },
        {
            MessageId: 'abc4',
            ReceiptHandle: 'abc4-1',
            Body: 'hello world',
            MessageAttributes: { }
        },
        {
            MessageId: 'abc5',
            ReceiptHandle: 'abc5-1',
            Body: 'hello world'
        },
    ]
}

class TestHandler extends Lib.Handlers.ProcessQueueHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        describe('Handlers.ProcessQueueHandler', () => {
            it(this.itTitle, () => {
                MOCKAWS.mock('SQS', 'receiveMessage', this.mockSqsReceiveMessage);
                MOCKAWS.mock('SQS', 'deleteMessage', this.mockSqsDeleteMessage);
                MOCKAWS.mock('Lambda', 'invoke', this.mockLambdaInvoke);

                return super.process(request, response).then(() => {
                    MOCKAWS.restore('Lambda');
                    MOCKAWS.restore('SQS');
                });
            });
        })
        return Promise.resolve();
    }

    public mockSqsReceiveMessage: (
        params:AWS.SQS.ReceiveMessageRequest,
        callback: {(error: Error, data: AWS.SQS.ReceiveMessageResult): void}
    ) => void;

    public mockSqsDeleteMessage: (
        params:AWS.SQS.DeleteMessageRequest,
        callback: {(error: Error, data: any): void}
    ) => void;

    public mockLambdaInvoke: (
        params:AWS.Lambda.InvocationRequest,
        callback: {(error: Error, data: AWS.Lambda.InvocationResponse): void}
    ) => void;

    public itTitle: string;
}

describe('Handlers.ProcessQueueHandler', () => {
    let handler: TestHandler;

    // Testing the handler without any config
    handler = new TestHandler(queue);
    handler.mockSqsReceiveMessage = (params:AWS.SQS.ReceiveMessageRequest, callback) => {
        assert.equal(params.QueueUrl, queue.url());
        assert.equal(params.MessageAttributeNames.join(), 'lambdaFn');
        callback(null, sqsMessages);
    };
    handler.mockSqsDeleteMessage = (params:AWS.SQS.DeleteMessageRequest, callback) => {
        assert.equal(params.QueueUrl, queue.url());
        assert.equal(params.ReceiptHandle, 'abc1-1');
        callback(null, {});
    };

    handler.mockLambdaInvoke = mockLambda
    handler.itTitle = 'Configless handler';
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        let body = JSON.parse(response.body);
        assert.equal(body.errorCount, 4);
        assert.equal(body.successCount, 1);
        assert.equal(response.statusCode, 200);
    });

    // Testing the handler with settings
    let config: Lib.Config.ProcessQueueHandlerConfig = {
        lambdaFnPrefix: 'test-',
        messageNumber: 13,
        visibilityTimeout: 666
    }
    handler = new TestHandler(queue, config);
    handler.mockSqsReceiveMessage = (params:AWS.SQS.ReceiveMessageRequest, callback) => {
        assert.equal(params.MessageAttributeNames.join(), 'lambdaFn');
        assert.equal(params.QueueUrl, queue.url());
        assert.equal(params.VisibilityTimeout, 666)
        assert.equal(params.MaxNumberOfMessages, 13)
        callback(null, sqsMessages);
    };
    handler.mockSqsDeleteMessage = (params:AWS.SQS.DeleteMessageRequest, callback) => {
        assert.equal(params.QueueUrl, queue.url());
        assert.equal(params.ReceiptHandle, 'abc1-1');
        callback(null, {});
    };

    handler.mockLambdaInvoke = (params: AWS.Lambda.InvocationRequest, callback) => {
        assert.match(params.FunctionName, /^test-/);
        params.FunctionName = params.FunctionName.replace(/^test-/, '');
        mockLambda(params, callback)
    }
    handler.itTitle = 'Testing the handler with settings';
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        let body = JSON.parse(response.body);
        assert.equal(body.errorCount, 4);
        assert.equal(body.successCount, 1);
        assert.equal(response.statusCode, 200);
    });

    // Testing the handler with a explicitly defined Function
    config = {
        lambdaFn: 'Succeed'
    }
    handler = new TestHandler(queue, config);
    handler.mockSqsReceiveMessage = (params:AWS.SQS.ReceiveMessageRequest, callback) => {
        assert.isNotOk(params.MessageAttributeNames);
        assert.equal(params.QueueUrl, queue.url());
        callback(null, sqsMessages);
    };
    let deletedReceiptHandle:string[] = []
    handler.mockSqsDeleteMessage = (params:AWS.SQS.DeleteMessageRequest, callback) => {
        assert.equal(params.QueueUrl, queue.url());
        deletedReceiptHandle.push(params.ReceiptHandle);
        callback(null, {});
    };

    handler.mockLambdaInvoke = (params: AWS.Lambda.InvocationRequest, callback) => {
        assert.equal(params.FunctionName, 'Succeed');
        mockLambda(params, callback)
    }
    handler.itTitle = 'Testing the handler with explicitly defined Function';
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        let body = JSON.parse(response.body);
        assert.equal(body.errorCount, 0);
        assert.equal(body.successCount, 5);
        assert.lengthOf(deletedReceiptHandle, 5);
        assert.equal(response.statusCode, 200);
    });

    // Testing the handler with an empty message list
    handler = new TestHandler(queue);
    handler.mockSqsReceiveMessage = (params:AWS.SQS.ReceiveMessageRequest, callback) => {
        assert.equal(params.QueueUrl, queue.url());
        delete sqsMessages.Messages;
        callback(null, sqsMessages);
    };
    handler.mockSqsDeleteMessage = (params:AWS.SQS.DeleteMessageRequest, callback) => {
        assert(false, 'There should not be any message to delete')
        callback(null, {});
    };

    handler.mockLambdaInvoke = (params: AWS.Lambda.InvocationRequest, callback) => {
        assert(false, 'There shoudl not be any invocation')
    }
    handler.itTitle = 'Testing the handler with an empty message list';
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        let body = JSON.parse(response.body);
        assert.equal(body.errorCount, 0);
        assert.equal(body.successCount, 0);
        assert.equal(response.statusCode, 200);
    });

});
