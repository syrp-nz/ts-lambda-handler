import { AmazonResourceName } from './AmazonResourceName';
export declare class SQSQueueARN extends AmazonResourceName {
    service: string;
    /**
     * Build a URL for this queue.
     * @throws {Error} If a component is missing from the ARN
     * @return {string} [description]
     */
    url(): string;
    /**
     * Receives an ARN and return a matching SQS Arn.
     * @param  {string|AmazonResourceName} arn
     * @return {SQSQueueARN}
     */
    static normalize(arn: string | AmazonResourceName): SQSQueueARN;
}
