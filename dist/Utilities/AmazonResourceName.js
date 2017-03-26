"use strict";
/**
 * Represent an Amazon Resource Name as defined on http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
 */
var AmazonResourceName = (function () {
    function AmazonResourceName(arn) {
        if (arn === void 0) { arn = ''; }
        /**
         * Defaults to 'aws'
         * @type {string}
         */
        this.partition = 'aws';
        this.service = '';
        /**
         * Defaults to the value of `process.env.AWS_DEFAULT_REGION` if defined.
         * @type {string}
         */
        this.region = process.env.AWS_DEFAULT_REGION ? process.env.AWS_DEFAULT_REGION : '';
        /**
         * Defaults to the value of `process.env.AWS_ACCOUNT_ID` if defined.
         * @type {string}
         */
        this.accountId = process.env.AWS_ACCOUNT_ID ? process.env.AWS_ACCOUNT_ID : '';
        this.resourceType = '';
        this.resource = '';
        if (arn) {
            this.parse(arn);
        }
    }
    ;
    /**
     * Populate the sub-component of this ARN from a string. Will throw an exception if the strin is invalid.
     * @param  {string = ''}
     * @return this
     */
    AmazonResourceName.prototype.parse = function (arn) {
        if (arn === void 0) { arn = ''; }
        var regex = /^arn:(aws[a-z0-9\-]*):([a-z0-9\-]+):([a-z0-9\-]*):(\d*):([A-Za-z0-9\-_]*)([:\/](.+))?$/g;
        var matches = regex.exec(arn);
        if (matches) {
            this.partition = matches[1];
            this.service = matches[2];
            this.region = matches[3];
            this.accountId = matches[4];
            if (matches[6]) {
                this.resourceType = matches[5];
                this.resource = matches[7];
            }
            else {
                this.resourceType = '';
                this.resource = matches[5];
            }
        }
        else {
            throw new Error('Invalid ARN');
        }
        return this;
    };
    /**
     * Build a ARN string from the ARN componenents
     * @param {'/' | ':'} resourceSeperator Character use to sperate the resource type from the resource name. Defaults to /
     * @return {string} [description]
     */
    AmazonResourceName.prototype.toString = function (resourceSeperator) {
        if (resourceSeperator === void 0) { resourceSeperator = '/'; }
        if (this.partition.trim() == '' ||
            this.service.trim() == '' ||
            this.resource.trim() == '') {
            throw new Error('ARN components undefined');
        }
        var arn = 'arn:' +
            this.partition.trim() + ":" +
            this.service.trim() + ":" +
            this.region.trim() + ":" +
            this.accountId.toString() + ":";
        if (this.resourceType.trim()) {
            arn += this.resourceType.trim() + resourceSeperator;
        }
        arn += this.resource.trim();
        return arn;
    };
    /**
     * Receives an ARN or ARN string and return a matching AmazonResourceName.
     * @param  {string|AmazonResourceName} arn
     * @return {SQSQueueARN}
     */
    AmazonResourceName.normalize = function (arn) {
        if (arn instanceof AmazonResourceName) {
            return arn;
        }
        else {
            return new AmazonResourceName(arn.toString());
        }
    };
    return AmazonResourceName;
}());
exports.AmazonResourceName = AmazonResourceName;
//# sourceMappingURL=/var/www/LambdaHandler/src/Utilities/AmazonResourceName.js.map