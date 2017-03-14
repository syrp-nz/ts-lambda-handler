declare let process:any;

/**
 * Represent an Amazon Resource Name as defined on http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
 */
export class AmazonResourceName {

    /**
     * Defaults to 'aws'
     * @type {string}
     */
    public partition: string = 'aws';

    public service: string = '';

    /**
     * Defaults to the value of `process.env.AWS_DEFAULT_REGION` if defined.
     * @type {string}
     */
    public region: string = process.env.AWS_DEFAULT_REGION ? process.env.AWS_DEFAULT_REGION: '';

    /**
     * Defaults to the value of `process.env.AWS_ACCOUNT_ID` if defined.
     * @type {string}
     */
    public accountId: string = process.env.AWS_ACCOUNT_ID ? process.env.AWS_ACCOUNT_ID: '';;

    public resourceType: string = '';

    public resource: string = '';

    constructor(arn: string = '') {
        if (arn) {
            this.parse(arn);
        }
    }

    /**
     * Populate the sub-component of this ARN from a string. Will throw an exception if the strin is invalid.
     * @param  {string = ''}
     * @return this
     */
    public parse(arn: string = ''): this {
        let regex = /^arn:(aws[a-z0-9\-]*):([a-z0-9\-]+):([a-z0-9\-]*):(\d*):([A-Za-z0-9\-_]*)([:\/](.+))?$/g;
        let matches = regex.exec(arn);
        if (matches) {
            this.partition = matches[1];
            this.service = matches[2];
            this.region = matches[3];

            this.accountId = matches[4];
            if (matches[6]) {
                this.resourceType = matches[5];
                this.resource = matches[7];
            } else {
                this.resourceType = '';
                this.resource = matches[5];
            }
        } else {
            throw new Error('Invalid ARN');
        }

        return this;
    }

    /**
     * Build a ARN string from the ARN componenents
     * @param {'/' | ':'} resourceSeperator Character use to sperate the resource type from the resource name. Defaults to /
     * @return {string} [description]
     */
    public toString(resourceSeperator: '/' | ':' = '/'): string {
        if (
            this.partition.trim() == '' ||
            this.service.trim() == '' ||
            this.resource.trim() == ''
        ) {
            throw new Error('ARN components undefined');
        }

        let arn = 'arn:' +
            this.partition.trim() + ":" +
            this.service.trim() + ":" +
            this.region.trim() + ":" +
            this.accountId.toString() + ":";

        if (this.resourceType.trim()) {
            arn += this.resourceType.trim() + resourceSeperator;
        }

        arn += this.resource.trim();

        return arn;
    }



}
