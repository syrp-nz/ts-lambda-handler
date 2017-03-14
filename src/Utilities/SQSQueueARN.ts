import { AmazonResourceName } from './AmazonResourceName';

export class SQSQueueARN extends AmazonResourceName {

    public service: string = 'sqs';

    /**
     * Build a URL for this queue.
     * @throws {Error} If a component is missing from the ARN
     * @return {string} [description]
     */
    public url(): string {
        if (this.service != 'sqs' || !this.region.trim() || !this.resource.trim()) {
            throw new Error('Invalid ARN subcomponent');
        } else {
            return 'https://' +
                this.service + '.' +
                this.region.trim() +
                '.amazonaws.com/' +
                this.accountId + '/' +
                this.resource.trim();
        }
    }

    /**
     * Receives an ARN and return a matching SQS Arn.
     * @param  {string|AmazonResourceName} arn
     * @return {SQSQueueARN}
     */
    public static normalize(arn:string|AmazonResourceName): SQSQueueARN {
        if (arn instanceof SQSQueueARN) {
            return <SQSQueueARN> arn;
        } else {
            return new SQSQueueARN(arn.toString());
        }
    }

}
