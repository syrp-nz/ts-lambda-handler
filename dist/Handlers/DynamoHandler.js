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
var aws_sdk_1 = require("aws-sdk");
var ValidationError_1 = require("../Errors/ValidationError");
var JOI = require("joi");
/**
 * An Handler to implement a REST endpoint for a Dynamo table.
 */
var DynamoHandler = (function (_super) {
    __extends(DynamoHandler, _super);
    function DynamoHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Index to use when searching for results. If left blank search will be executed against the main table.
         */
        _this.indexName = undefined;
        /**
         * The default number of results to return.
         */
        _this.defaultLimit = 20;
        /**
         * The default list of fields to return. If left empty, all projected fields will be return.
         */
        _this.defaultFields = [];
        /**
         * Those fields will never be returned to the client. Fields you might want to include here could be a salt or a
         * password hash. You definitely don't need to include a password field in here, because you are a good developer
         * who always hash passwords using a one-way cryptographically strong hashing algorithm and would never consider
         * for the life of them storing plain text password.
         *
         * Values may be provdied using a dot notation. e.g.: topObject.childrenObject.propertyToRemove
         */
        _this.blacklistedFields = [];
        /**
         * The search index that will be used for the general listing GET request. Leave blank if you want to use the default index.
         */
        _this.searchIndex = '';
        _this.expressionAttributeNames = {};
        _this.expressionAttributeValues = {};
        return _this;
    }
    DynamoHandler.prototype.process = function (request, response) {
        switch (request.getMethod()) {
            case "GET":
                if (request.getResourceId()) {
                }
                else {
                    return this.search();
                }
                break;
            case "OPTIONS":
                response.send();
                break;
        }
    };
    DynamoHandler.prototype.search = function () {
        var _this = this;
        return this.searchValidation().then(function () {
            var param = _this.initSearch();
            var client = new aws_sdk_1.DynamoDB.DocumentClient();
            return client.query(param).promise()
                .then(function (results) { return _this.formatSearchResult(results); })
                .then(function (formattedResults) {
                _this.response.setBody(formattedResults).send();
                return Promise.resolve();
            });
        });
    };
    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]}
     */
    DynamoHandler.prototype.searchValidation = function () {
        var result = JOI.validate(this.request.data.queryStringParameters, JOI.object().keys(this.searchValidationSchema()));
        if (result.error) {
            return Promise.reject(new ValidationError_1.ValidationError(result.error.details));
        }
        else {
            return Promise.resolve();
        }
    };
    DynamoHandler.prototype.searchValidationSchema = function () {
        var schemaMap = {
            limit: JOI.number().integer().min(0).max(150)
        };
        return schemaMap;
    };
    DynamoHandler.prototype.initSearch = function () {
        var params = {
            TableName: this.table,
            Limit: parseInt(this.request.getQueryStringParameter('limit', this.defaultLimit.toString())),
            IndexName: this.indexName,
            KeyConditionExpression: this.getKeyConditionExpression(),
            FilterExpression: this.getFilterExpression(),
            ExclusiveStartKey: this.getExclusiveStartKey()
        };
        if (Object.keys(this.expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = this.expressionAttributeNames;
        }
        if (Object.keys(this.expressionAttributeValues).length > 0) {
            params.ExpressionAttributeValues = this.expressionAttributeValues;
        }
        var projectionExp = this.getProjectionExpression();
        switch (projectionExp) {
            case '*':
                params.Select = 'ALL_ATTRIBUTES';
                break;
            case '':
                params.Select = 'ALL_PROJECTED_ATTRIBUTES';
                break;
            default:
                params.Select = 'SPECIFIC_ATTRIBUTES';
                params.ProjectionExpression = projectionExp;
        }
        return params;
    };
    /**
     * Get a value suitable for the Key Condition Expression parameter when perfoming a search.
     */
    DynamoHandler.prototype.getKeyConditionExpression = function () {
        return undefined;
    };
    /**
     * Get a value suitable for the Filter Expression parameter when perfoming a search.
     */
    DynamoHandler.prototype.getFilterExpression = function () {
        return undefined;
    };
    /**
     * Add an expression to the ExpressionAttributeNames list for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    DynamoHandler.prototype.addExpAttrName = function (key, value) {
        this.expressionAttributeNames[key] = value;
    };
    /**
     * Add an expression to the ExpressionAttributeValues attributes for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    DynamoHandler.prototype.addExpAttrValue = function (key, value) {
        this.expressionAttributeValues[key] = value;
    };
    /**
     * Define what field should be returned. This is controlled by the `defaultFields` property. If '*' is returned, all attributes will be returned. If the return value is empty, all projected attributes will be returned. If a comma seperated list of field is returned, only those fields will be returned.
     * @return {string}
     */
    DynamoHandler.prototype.getProjectionExpression = function () {
        if (this.defaultFields.length > 0) {
            return this.defaultFields.join(',');
        }
        else {
            return '';
        }
    };
    /**
     * Receives results from a Dynamo Query and format them so they are suitable for our purposes. Out of the box it
     * removes the count and scanned count values. It also calls scrubData to remove any black listed fields.
     *
     * Child object can override this method if they require further formatting of the output.
     * @param  {DynamoDB.QueryOutput} results [description]
     * @return {Promise<any>}                 [description]
     */
    DynamoHandler.prototype.formatSearchResult = function (results) {
        var _this = this;
        results.Items.forEach(function (item) { _this.scrubData(item); });
        delete results.Count;
        delete results.ScannedCount;
        return Promise.resolve(results);
    };
    /**
     * Remove all black listed fields from the item.
     * @param  {any} item
     * @return {any}
     */
    DynamoHandler.prototype.scrubData = function (item) {
        for (var _i = 0, _a = this.blacklistedFields; _i < _a.length; _i++) {
            var fieldPath = _a[_i];
            this.removeItem(item, fieldPath.split('.'));
        }
        return item;
    };
    /**
     * Recursive method that remove the given property as defined by the path from the item.
     * @param  {any}      item
     * @param  {string[]} path
     */
    DynamoHandler.prototype.removeItem = function (item, path) {
        var fieldName = path.shift();
        if (item[fieldName]) {
            if (path.length == 0) {
                delete item[fieldName];
            }
            else {
                this.removeItem(item[fieldName], path);
            }
        }
    };
    return DynamoHandler;
}(AbstractHandler_1.AbstractHandler));
exports.DynamoHandler = DynamoHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/DynamoHandler.js.map