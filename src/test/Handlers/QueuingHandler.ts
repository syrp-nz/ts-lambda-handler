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
const fnName = 'someLambdaFunctionName';

class TestHandler extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        it('No Lambda Function', () => {
            MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                assert.equal(params.QueueUrl, queue.url());
                assert.equal(params.MessageBody, JSON.stringify(fakeEvent));
                assert.isNotOk(params.MessageAttributes);
                callback(null, 'hello');
            });

            return super.process(request, response).then(() => {
                MOCKAWS.restore('SQS');
            });
        });
        return Promise.resolve();
    }
}

class TestHandlerWithLambdaFn extends Lib.Handlers.QueuingHandler {
    public process(request: Lib.Request, response: Lib.Response): Promise<void> {
        it('With some Lambda Function', () => {
            MOCKAWS.mock('SQS', 'sendMessage', (params:AWS.SQS.SendMessageRequest, callback) => {
                assert.equal(params.QueueUrl, queue.url());
                assert.equal(params.MessageBody, JSON.stringify(fakeEvent));
                assert.isOk(params.MessageAttributes);
                assert.isOk(params.MessageAttributes['lambdaFn']);
                assert.equal(params.MessageAttributes['lambdaFn'].StringValue, fnName);
                callback(null, 'hello');
            });

            return super.process(request, response).then(() => {
                MOCKAWS.restore('SQS');
            });
        });
        return Promise.resolve();
    }
}

describe('Handlers.QueuingHandler', () => {
    let handler = new TestHandler(queue);

    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });

    handler = new TestHandlerWithLambdaFn(queue, fnName);
    handler.handle(fakeEvent, MockContext(), (error, response: Lambda.ProxyResult) => {
        assert.isNotOk(error);
        assert.equal(response.statusCode, 200);
    });
});
