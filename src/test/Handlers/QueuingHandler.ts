import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../index';
import * as Lambda from 'aws-lambda';
import { fakeEvent } from '../FakeEvent';
import * as MOCKAWS from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import * as MockContext from 'aws-lambda-mock-context';

const assert = chai.assert;
const queue = new Lib.Utilities.SQSQueueARN('arn:aws:sqs:us-west-2:123456789:QueueName');
const topic = new Lib.Utilities.AmazonResourceName('arn:aws:sqs:us-west-2:123456789:TopicName');
const fnName = 'someLambdaFunctionName';

class TestHandler extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        describe('Handlers.QueuingHandler', () => {
            it('No Lambda Function', () => {
                MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                    assert.equal(params.QueueUrl, queue.url());
                    assert.equal(params.MessageBody, JSON.stringify(fakeEvent));
                    assert.isNotOk(params.MessageAttributes);
                    const data: AWS.SQS.SendMessageResult = {
                        MessageId: 'qwerty123'
                    };
                    callback(null, data);
                });

                MOCKAWS.mock('SNS', 'publish', (params:AWS.SNS.PublishInput, callback)  => {
                    assert(false, 'SNS Topic should not be published to');
                });

                return super.process(request, response).then(() => {
                    MOCKAWS.restore('SQS');
                    MOCKAWS.restore('SNS');
                });
            });
        });
        return Promise.resolve();
    }

    protected sendResponse(response: Lib.Response, data: AWS.SQS.SendMessageResult): Promise<void> {
        assert.isOk(data);
        assert.equal(data.MessageId, 'qwerty123');
        return super.sendResponse(response, data);
    }
}

class TestHandlerWithLambdaFn extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        describe('Handlers.QueuingHandler', () => {
            it('With some Lambda Function', () => {
                MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                    assert.equal(params.QueueUrl, queue.url());
                    assert.equal(params.MessageBody, JSON.stringify(fakeEvent));
                    assert.isOk(params.MessageAttributes);
                    assert.isOk(params.MessageAttributes['lambdaFn']);
                    assert.equal(params.MessageAttributes['lambdaFn'].StringValue, fnName);
                    callback(null, 'hello');
                });

                MOCKAWS.mock('SNS', 'publish', (params:AWS.SNS.PublishInput, callback)  => {
                    assert(false, 'SNS Topic should not be published to');
                });

                return super.process(request, response).then(() => {
                    MOCKAWS.restore('SQS');
                    MOCKAWS.restore('SNS');
                });
            });
        });

        return Promise.resolve();
    }
}

class TestHandlerWithSns extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        describe('Handlers.QueuingHandler', () => {
            it('With SNS Topic', () => {
                MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                    assert.equal(params.QueueUrl, queue.url());
                    assert.equal(params.MessageBody, JSON.stringify(fakeEvent));
                    assert.isNotOk(params.MessageAttributes);
                    callback(null, 'hello');
                });
                let snsCalled = false;
                MOCKAWS.mock('SNS', 'publish', (params:AWS.SNS.PublishInput, callback)  => {
                    assert.equal(params.TopicArn, topic.toString());
                    assert.equal(params.Message, JSON.stringify(fakeEvent));
                    const response: AWS.SNS.PublishResponse = {
                        MessageId: '123456789'
                    }
                    snsCalled = true;
                    callback(null, response);
                });

                return super.process(request, response).then(() => {
                    assert(snsCalled, 'SNS Topic was not published to');
                    MOCKAWS.restore('SQS');
                    MOCKAWS.restore('SNS');
                });
            });
        });
        return Promise.resolve();
    }
}

class TestHandlerWithInvalidRequest extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        describe('Handlers.QueuingHandler', () => {
            it('Request is judge invalid', () => {
                MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                    assert(false, 'SQS.sendMessage should not be called if the request is judge invalid.')
                });

                MOCKAWS.mock('SNS', 'publish', (params:AWS.SNS.PublishInput, callback)  => {
                    assert(false, 'SNS.publish should not be called if the request is judge invalid.')
                });

                return super.process(request, response).then(() => {
                    MOCKAWS.restore('SQS');
                    MOCKAWS.restore('SNS');
                });
            });
        });
        return Promise.resolve();
    }

    protected sendResponse(response: Lib.Response, data: AWS.SQS.SendMessageResult): Promise<void> {
        assert.isNotOk(data);
        return super.sendResponse(response, data);
    }

    protected validateRequest(request: Lib.Request): Promise<boolean> {
        return Promise.resolve(false);
    }
}

describe('Handlers.QueuingHandler', () => {
    let handler: Lib.Handlers.QueuingHandler = new TestHandler(queue);

    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });

    handler = new TestHandlerWithLambdaFn(queue, {lambdaFn: fnName});
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });

    handler = new TestHandlerWithSns(queue, {notifySNSTopic: topic});
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });

    handler = new TestHandlerWithInvalidRequest(queue);
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });
});
