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
    function QueuingHandler(arn, lambdaFn, config) {
        if (lambdaFn === void 0) { lambdaFn = ''; }
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.lambdaFn = lambdaFn;
        _this.arn = Utilities_1.SQSQueueARN.normalize(arn);
        return _this;
    }
    QueuingHandler.prototype.process = function (request, response) {
        var _this = this;
        return this.validateRequest(request).then(function () {
            // Build our message
            var param = {
                MessageBody: JSON.stringify(request.data),
                QueueUrl: _this.arn.url()
            };
            if (_this.lambdaFn) {
                param.MessageAttributes = {
                    "lambdaFn": {
                        DataType: "String",
                        StringValue: _this.lambdaFn
                    }
                };
            }
            // Set up the message request.
            var sqs = new AWS.SQS;
            return sqs.sendMessage(param).promise();
        }).then(function (data) {
            _this.sendResponse(response);
        });
    };
    /**
     * You can override this method if the event needs validated in some way before being stored in a queue. If the
     * event is invalid, this method should return a rejected promise with an suitable HttpError.
     *
     * If the method is not overriden, the event will systematically be stored in the queue.
     *
     * @return {Promise<void>} [description]
     */
    QueuingHandler.prototype.validateRequest = function (request) {
        return Promise.resolve();
    };
    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}      response
     * @return {Promise<void>}
     */
    QueuingHandler.prototype.sendResponse = function (response) {
        response.send();
        return Promise.resolve();
    };
    return QueuingHandler;
}(AbstractHandler_1.AbstractHandler));
exports.QueuingHandler = QueuingHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/QueuingHandler.js.map