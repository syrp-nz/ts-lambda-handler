import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../';

let assert = chai.assert;

const ARN = 'arn:aws:sqs:us-west-2:123456789:QueueName';
const URL = 'https://sqs.us-west-2.amazonaws.com/123456789/QueueName'
describe('SQSQueueARN', () => {

    it('url', () => {
        let arn = new Lib.Utilities.SQSQueueARN(ARN);
        assert.equal(arn.url(), URL);

        arn.service = 's3';
        assert.throws(() => arn.url() );

        arn.parse(ARN);
        arn.region = '';
        assert.throws(() => arn.url() );

        arn.parse(ARN);
        arn.resource = '';
        assert.throws(() => arn.url() );

    });

    it('normalize', () => {
        let arn = Lib.Utilities.SQSQueueARN.normalize(ARN);
        assert.equal(arn.url(), URL);

        arn = Lib.Utilities.SQSQueueARN.normalize(new Lib.Utilities.AmazonResourceName(ARN));
        assert.equal(arn.url(), URL);

        arn = Lib.Utilities.SQSQueueARN.normalize(new Lib.Utilities.SQSQueueARN(ARN));
        assert.equal(arn.url(), URL);
    });
});
