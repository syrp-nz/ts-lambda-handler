"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractHandler_1 = require("./AbstractHandler");
var AWS = require("aws-sdk");
var Utilities_1 = require("../Utilities");
var Functions_1 = require("../Utilities/Functions");
exports.LAMBDA_FN_ATTR = 'lambdaFn';
/**
 * Read messages from an SQS Queue and attempt to process them with Lambda functions.
 */
var ProcessQueueHandler = (function (_super) {
    __extends(ProcessQueueHandler, _super);
    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {ProcessQueueHandlerConfig} config
     */
    function ProcessQueueHandler(arn, config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = config;
        _this.jobErrors = {};
        _this.jobSuccesses = {};
        _this.arn = Utilities_1.SQSQueueARN.normalize(arn);
        return _this;
    }
    ProcessQueueHandler.prototype.process = function (request, response) {
        var _this = this;
        return this.readMessages()
            .then(function (data) { return _this.processMessages(data); })
            .then(function () {
            // Log errors if there's any. We suppress the output when running unit test.
            if (Object.keys(_this.jobErrors).length > 0 && !Functions_1.isInTestingMode()) {
                console.error(_this.jobErrors);
            }
            // Return the error and success counts
            response.setBody({
                errorCount: Object.keys(_this.jobErrors).length,
                successCount: Object.keys(_this.jobSuccesses).length
            }).send();
            return Promise.resolve();
        });
    };
    /**
     * Read messages from the queue
     * @return {Promise<AWS.SQS.ReceiveMessageRequest>}
     */
    ProcessQueueHandler.prototype.readMessages = function () {
        var params = {
            QueueUrl: this.arn.url()
        };
        // If we don't explicitely define a lambda function to call, fet the lambdaFn attribute from the Queue.
        if (this.config.lambdaFn == undefined || this.config.lambdaFn == '') {
            params.MessageAttributeNames = [exports.LAMBDA_FN_ATTR];
        }
        // If we explicitely ask for a number of message to retrieve
        if (this.config.messageNumber && this.config.messageNumber > 0) {
            params.MaxNumberOfMessages = this.config.messageNumber;
        }
        // If we set a visibility timeout on the queue.
        if (this.config.visibilityTimeout && this.config.visibilityTimeout > 0) {
            params.VisibilityTimeout = this.config.visibilityTimeout;
        }
        var sqs = new AWS.SQS;
        return sqs.receiveMessage(params).promise();
    };
    /**
     * Given a list of SQS message, launch a bunch of Lambda function to process them.
     * @param  {AWS.SQS.ReceiveMessageResult} data [description]
     * @return {Promise<any>}                      [description]
     */
    ProcessQueueHandler.prototype.processMessages = function (data) {
        var _this = this;
        var promises = [];
        var _loop_1 = function (msg) {
            promises.push(this_1.invoke(msg)
                .then(function (data) { return _this.readInvocationResponse(data, msg.MessageId); })
                .then(function () { return _this.removeMessageFromQueue(msg.ReceiptHandle); })
                .catch(function (error) { return _this.readInvocationError(error, msg.MessageId); }));
        };
        var this_1 = this;
        // Loop over the SQS message
        for (var _i = 0, _a = data.Messages; _i < _a.length; _i++) {
            var msg = _a[_i];
            _loop_1(msg);
        }
        // Wait for all the invocation to resolve.
        return Promise.all(promises);
    };
    /**
     * Given an SQS function, fires an AWS Lambda function to process it.
     * @param  {AWS.SQS.Message}                        msg
     * @return {Promise<AWS.Lambda.InvocationResponse>}
     */
    ProcessQueueHandler.prototype.invoke = function (msg) {
        var fnName = this.config.lambdaFnPrefix ?
            this.config.lambdaFnPrefix :
            '';
        if (this.config.lambdaFn && this.config.lambdaFn != '') {
            fnName += this.config.lambdaFn;
        }
        else if (msg.MessageAttributes && msg.MessageAttributes[exports.LAMBDA_FN_ATTR]) {
            fnName += msg.MessageAttributes[exports.LAMBDA_FN_ATTR].StringValue;
        }
        else {
            return Promise.reject(new Error('No function defined for processing Message ID ' + msg.MessageId));
        }
        var params = {
            FunctionName: fnName,
            InvocationType: 'RequestResponse',
            Payload: msg.Body
        };
        var lambda = new AWS.Lambda;
        return lambda.invoke(params).promise();
    };
    /**
     * Read the response from an invocation and determine if it's a success or a failure.
     * @param  {AWS.Lambda.InvocationResponse} data [description]
     * @return {Promise<void>}                   [description]
     */
    ProcessQueueHandler.prototype.readInvocationResponse = function (data, messageId) {
        if (data.StatusCode < 400) {
            this.jobSuccesses[messageId] = data;
            return Promise.resolve();
        }
        else {
            return Promise.reject(data);
        }
    };
    /**
     * Remove a message from a SQS queue
     * @param  {string}       receitHandle Receipt handle that will have been provided when the message was fetched.
     * @return {Promise<any>}
     */
    ProcessQueueHandler.prototype.removeMessageFromQueue = function (receitHandle) {
        var sqs = new AWS.SQS;
        return sqs.deleteMessage({
            QueueUrl: this.arn.url(),
            ReceiptHandle: receitHandle
        }).promise();
    };
    /**
     * Catch an invocation error
     * @param  {[type]}        error [description]
     * @return {Promise<void>}       [description]
     */
    ProcessQueueHandler.prototype.readInvocationError = function (error, messageId) {
        this.jobErrors[messageId] = error;
        return Promise.resolve();
    };
    return ProcessQueueHandler;
}(AbstractHandler_1.AbstractHandler));
exports.ProcessQueueHandler = ProcessQueueHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/ProcessQueueHandler.js.map