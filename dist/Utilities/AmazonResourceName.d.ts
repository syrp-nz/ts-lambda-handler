/**
 * Represent an Amazon Resource Name as defined on http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
 */
export declare class AmazonResourceName {
    /**
     * Defaults to 'aws'
     * @type {string}
     */
    partition: string;
    service: string;
    /**
     * Defaults to the value of `process.env.AWS_DEFAULT_REGION` if defined.
     * @type {string}
     */
    region: string;
    /**
     * Defaults to the value of `process.env.AWS_ACCOUNT_ID` if defined.
     * @type {string}
     */
    accountId: string;
    resourceType: string;
    resource: string;
    constructor(arn?: string);
    /**
     * Populate the sub-component of this ARN from a string. Will throw an exception if the strin is invalid.
     * @param  {string = ''}
     * @return this
     */
    parse(arn?: string): this;
    /**
     * Build a ARN string from the ARN componenents
     * @param {'/' | ':'} resourceSeperator Character use to sperate the resource type from the resource name. Defaults to /
     * @return {string} [description]
     */
    toString(resourceSeperator?: '/' | ':'): string;
    /**
     * Receives an ARN or ARN string and return a matching AmazonResourceName.
     * @param  {string|AmazonResourceName} arn
     * @return {SQSQueueARN}
     */
    static normalize(arn: ArnOrString): AmazonResourceName;
}
export declare type ArnOrString = string | AmazonResourceName;
