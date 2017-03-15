import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../';

let assert = chai.assert;

const ARN_EB = 'arn:aws:elasticbeanstalk:us-east-1:123456789012:environment/My App/MyEnvironment';
const ARN_IAM_USER = 'arn:aws:iam::123456789012:user/David';
const ARN_RDS_INSTANCE = 'arn:aws:rds:eu-west-1:123456789012:db:mysql-db';
const ARN_S3 = 'arn:aws:s3:::my_corporate_bucket/exampleobject.png';
const ARN_CD = 'arn:aws:codecommit:us-east-1:123456789012:MyDemoRepo';


describe('AmazonResourceName', () => {

    it('constructor', () => {
        assert.doesNotThrow(() => new Lib.Utilities.AmazonResourceName());
        assert.doesNotThrow(() => new Lib.Utilities.AmazonResourceName(''));
        assert.throws(() => new Lib.Utilities.AmazonResourceName('non sensicall') );
        assert.doesNotThrow(() => new Lib.Utilities.AmazonResourceName(ARN_EB));
    });

    it('parse', () => {
        let arn = new Lib.Utilities.AmazonResourceName();
        assert.throws(() => arn.parse(''));
        assert.throws(() => arn.parse('non sensical') );
        assert.doesNotThrow(() => arn.parse(ARN_IAM_USER));
        assert.doesNotThrow(() => arn.parse(ARN_RDS_INSTANCE));
        assert.doesNotThrow(() => arn.parse(ARN_S3));
        assert.doesNotThrow(() => arn.parse(ARN_EB));

        assert.equal(arn.partition, 'aws');
        assert.equal(arn.service, 'elasticbeanstalk');
        assert.equal(arn.region, 'us-east-1');
        assert.equal(arn.accountId, 123456789012);
        assert.equal(arn.resourceType, 'environment');
        assert.equal(arn.resource, 'My App/MyEnvironment');

        assert.doesNotThrow(() => arn.parse(ARN_CD));
        assert.equal(arn.partition, 'aws');
        assert.equal(arn.service, 'codecommit');
        assert.equal(arn.region, 'us-east-1');
        assert.equal(arn.accountId, 123456789012);
        assert.equal(arn.resourceType, '');
        assert.equal(arn.resource, 'MyDemoRepo');

    });

    it('toString', () => {
        let arn = new Lib.Utilities.AmazonResourceName();
        arn.parse(ARN_EB);
        assert.equal(arn.toString(), ARN_EB);
        assert.equal(arn.toString('/'), ARN_EB);

        arn.parse(ARN_RDS_INSTANCE);
        assert.equal(arn.toString(':'), ARN_RDS_INSTANCE);

        arn.parse(ARN_CD);
        assert.equal(arn.toString(), ARN_CD);
        assert.equal(arn.toString(':'), ARN_CD);
        assert.equal(arn.toString('/'), ARN_CD);
    })

    it('normalize', () => {
        let arn = Lib.Utilities.AmazonResourceName.normalize(ARN_EB);
        assert.equal(arn.toString(), ARN_EB);

        arn = Lib.Utilities.AmazonResourceName.normalize(new Lib.Utilities.AmazonResourceName(ARN_EB));
        assert.equal(arn.toString(), ARN_EB);
    });
});
