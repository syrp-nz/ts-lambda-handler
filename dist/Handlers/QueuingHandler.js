"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractHandler_1 = require("./AbstractHandler");
var AWS = require("aws-sdk");
var Utilities_1 = require("../Utilities");
/**
 * Get an event store to a queue with a schedule function to run it.
 */
var QueuingHandler = (function (_super) {
    __extends(QueuingHandler, _super);
    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {string}                    lambdaFn Lambda function that will be used to process the message. This will
     *                                              be stored as an attribute on the message. If left blank, no
     *                                              attribute will be stored and the processing method will need to be
     *                                              define manually.
     * @param  {HandlerConfig}              config
     */
    function QueuingHandler(arn, config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = config;
        _this.arn = Utilities_1.SQSQueueARN.normalize(arn);
        return _this;
    }
    QueuingHandler.prototype.process = function (request, response) {
        var _this = this;
        return this.validateRequest(request).then(function (storeInQueue) {
            // If we are to store the evetn in a queue
            if (storeInQueue) {
                // Send request to SQS
                var param = _this.buildSQSmessage();
                var sqs = new AWS.SQS;
                return sqs.sendMessage(param)
                    .promise()
                    .then(function (data) {
                    // Send a SNS notification
                    return _this.publishToSNS(data)
                        .then(function () { return data; }); // Once the notification, pass along the SQS message reference
                });
            }
            else {
                // There's no message to queue, so lets not do anything.
                return Promise.resolve(null);
            }
        })
            .then(function (data) {
            return _this.sendResponse(response, data);
        });
    };
    /**
     * You can override this method if the event needs validated in some way before being stored in a queue.
     * If the Promise returns true, the event will be queue. If the Promise returns false, the event will not be store,
     * but we will still response to the webhook with a 200 OK.
     *
     * If an error needs to be reported to the client, reject the promise with a suitable HttpError.
     *
     * If the method is not overriden, the event will systematically be stored in the queue.
     *
     * @return {Promise<void>} [description]
     */
    QueuingHandler.prototype.validateRequest = function (request) {
        return Promise.resolve(true);
    };
    /**
     * Build the message that will be sent to SQS.
     * @return {AWS.SQS.SendMessageRequest} [description]
     */
    QueuingHandler.prototype.buildSQSmessage = function () {
        var param = {
            MessageBody: JSON.stringify(this.request.data),
            QueueUrl: this.arn.url()
        };
        if (this.config.lambdaFn) {
            param.MessageAttributes = {
                "lambdaFn": {
                    DataType: "String",
                    StringValue: this.config.lambdaFn
                }
            };
        }
        return param;
    };
    /**
     * Publish a notification to an SNS Topic once the event has been added to the Queue.
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {Promise<any>}                      [description]
     */
    QueuingHandler.prototype.publishToSNS = function (sqsData) {
        if (this.config.notifySNSTopic) {
            // Build our SNS publish params.
            var params = this.buildSNSMessage(Utilities_1.AmazonResourceName.normalize(this.config.notifySNSTopic), sqsData);
            // Send the message
            var sns = new AWS.SNS;
            return sns.publish(params).promise();
        }
        else {
            // Config says not to publish to SNS
            return Promise.resolve();
        }
    };
    /**
     * Build a message to publish to an SNS topic. The default behavior is to send stringify the event. Child class can
     * override this method to customize the message
     * @param  {AmazonResourceName}        arn     [description]
     * @param  {AWS.SQS.SendMessageResult} sqsData [description]
     * @return {AWS.SNS.PublishInput}              [description]
     */
    QueuingHandler.prototype.buildSNSMessage = function (arn, sqsData) {
        return {
            Message: JSON.stringify(this.request.data),
            Subject: "Message ID " + sqsData.MessageId + " added to Queue",
            TopicArn: arn.toString()
        };
    };
    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}                       response
     * @param  {AWS.SQS.SendMessageResult}      data The response from SQS. This may be null, if the message was not
     *                                               sent away.
     * @return {Promise<void>}
     */
    QueuingHandler.prototype.sendResponse = function (response, data) {
        if (data === void 0) { data = null; }
        response.send();
        return Promise.resolve();
    };
    return QueuingHandler;
}(AbstractHandler_1.AbstractHandler));
exports.QueuingHandler = QueuingHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/QueuingHandler.js.map