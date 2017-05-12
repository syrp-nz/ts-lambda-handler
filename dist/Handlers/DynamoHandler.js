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
var Errors_1 = require("../Errors");
var JOI = require("joi");
var uniqid = require("uniqid");
var extend = require("extend");
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
         * These fields can be outputed back to the client on read request, but will be purge from creation/update request.
         */
        _this.readonlyFields = [];
        /**
         * List of field to retrieve and merge with update statements. If defined this will cause the update function to
         * fetch a few fields from the existing record and merge them with the new value that will be put in the table.
         *
         * This can be helpfull to preserve attributes that the client can not modify directly, but that must still be
         * retained. e.g.: creation date
         */
        _this.onUpdateMergeFields = [];
        /**
         * What operation to use when performing the search.
         */
        _this.searchOperation = "query";
        return _this;
    }
    DynamoHandler.prototype.init = function (event, context, callback) {
        var _this = this;
        return _super.prototype.init.call(this, event, context, callback).then(function () {
            // Those values should be unique for each request. So we instanciate them here.
            _this.expressionAttributeNames = {};
            _this.expressionAttributeValues = {};
        });
    };
    DynamoHandler.prototype.process = function (request, response) {
        var p;
        switch (request.getMethod()) {
            case "GET":
                if (this.isSingleRequest()) {
                    p = this.retrieveSingle();
                }
                else {
                    p = this.search();
                }
                break;
            case "POST":
                if (this.isSingleRequest()) {
                    p = Promise.reject(new Errors_1.MethodNotAllowedError);
                }
                else {
                    p = this.create();
                }
                break;
            case "PUT":
                if (this.isSingleRequest()) {
                    p = this.update();
                }
                else {
                    p = Promise.reject(new Errors_1.MethodNotAllowedError);
                }
                break;
            case "DELETE":
                if (this.isSingleRequest()) {
                    p = this.delete();
                }
                else {
                    p = Promise.reject(new Errors_1.MethodNotAllowedError);
                }
                break;
            case "OPTIONS":
                response.send();
                p = Promise.resolve();
                break;
            default:
                p = Promise.reject(new Errors_1.MethodNotAllowedError);
        }
        return p;
    };
    /**
     * Provide an instance of DocumentClient to communicate with DynamoDB.
     * @return {DynamoDB.DocumentClient} [description]
     */
    DynamoHandler.prototype.getDocumentClient = function () {
        if (!this.docClient) {
            this.docClient = new aws_sdk_1.DynamoDB.DocumentClient;
        }
        return this.docClient;
    };
    /**
     * Analyze the request and detects if the request is for a specific entry. e.g.: retriving, updating, deleteing a
     * specific record.
     *
     * This method assumes you are using an id path parameter for this purpose. You may override it if your set up is
     * different.
     *
     * @return {boolean}
     */
    DynamoHandler.prototype.isSingleRequest = function () {
        return this.request.getResourceId() != '';
    };
    /**
     * Retrive a specific item from the DynamoDB table.
     * @return {Promise<void>}
     */
    DynamoHandler.prototype.retrieveSingle = function () {
        var _this = this;
        return this.getSingleKey().then(function (key) {
            var param = {
                TableName: _this.table,
                Key: key,
                ProjectionExpression: _this.getProjectionExpression()
            };
            if (param.ProjectionExpression == '*' || param.ProjectionExpression == '') {
                delete param.ProjectionExpression;
            }
            return _this.getDocumentClient().get(param).promise()
                .then(function (results) {
                if (results.Item) {
                    return _this.formatResult(results.Item);
                }
                else {
                    return Promise.reject(new Errors_1.NotFoundError);
                }
            }).then(function (data) {
                _this.response.setBody(data).send();
                return Promise.resolve();
            });
        });
    };
    /**
     * Return a key suitable for retriveing, deleting or updating a single item in the Dynamo table.
     *
     * The basic function assumes your key uses an ID column, but you can override this function if your table uses a
     * different key.
     * @param {boolean} newEntry If this is set to true, a unique id will be generated. This is suitable for creting a
     *                           new entry
     * @return {Promise<DynamoDB.Key>}
     */
    DynamoHandler.prototype.getSingleKey = function (newEntry) {
        if (newEntry === void 0) { newEntry = false; }
        return Promise.resolve({ 'id': newEntry ? uniqid() : this.request.getResourceId() });
    };
    /**
     * Search the DynamoDB table for records matchign the query.
     * @return {Promise<void>}
     */
    DynamoHandler.prototype.search = function () {
        var _this = this;
        return this.searchValidation().then(function () {
            var p;
            if (_this.searchOperation == 'query') {
                p = _this.getDocumentClient().query(_this.initSearch()).promise();
            }
            else {
                p = _this.getDocumentClient().scan(_this.initScanRequest()).promise();
            }
            return p.then(function (results) {
                return _this.formatSearchResult(results);
            }).then(function (formattedResults) {
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
            return Promise.reject(new Errors_1.ValidationError(result.error.details));
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Return a JOI Schema for validating the search request. You may override this function to add your own validation.
     * @return {JOI.SchemaMap}
     */
    DynamoHandler.prototype.searchValidationSchema = function () {
        var schemaMap = {
            limit: JOI.number().integer().min(0).max(150)
        };
        return schemaMap;
    };
    /**
     * Build the parameters for the Query request to DynamoDB
     * @return {DynamoDB.QueryInput} [description]
     */
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
        this.setProjectionOnRequest(params);
        return params;
    };
    DynamoHandler.prototype.initScanRequest = function () {
        var params = this.initSearch();
        if (params.FilterExpression) {
            params.FilterExpression = '(' + params.KeyConditionExpression + ') AND (' + params.FilterExpression + ')';
        }
        else {
            params.FilterExpression = params.KeyConditionExpression;
        }
        delete params.KeyConditionExpression;
        return params;
    };
    /**
     * Set the Select and ProjectionExpression field on a request.
     * @param  {DynamoDB.QueryInput} params
     * @return void
     */
    DynamoHandler.prototype.setProjectionOnRequest = function (params) {
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
        // Remove the counts
        delete results.Count;
        delete results.ScannedCount;
        // Format each item individually
        var promises = [];
        for (var _i = 0, _a = results.Items; _i < _a.length; _i++) {
            var item = _a[_i];
            promises.push(this.formatResult(item));
        }
        return Promise.all(promises).then(function () { return Promise.resolve(results); });
    };
    /**
     * Format an individual result item before it's returned to the client.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    DynamoHandler.prototype.formatResult = function (item) {
        item = this.scrubDataForRead(item);
        return this.augmentData(item);
    };
    /**
     * This method is run for each item before it is being returned to the client. It can be overridden if to tweak
     * results sent to the client. e.g.: Add a calculated read only field.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    DynamoHandler.prototype.augmentData = function (item) {
        return Promise.resolve(item);
    };
    /**
     * This method should be called on data item before being returned to the client. It removes all black listed
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    DynamoHandler.prototype.scrubDataForRead = function (item) {
        for (var _i = 0, _a = this.blacklistedFields; _i < _a.length; _i++) {
            var fieldPath = _a[_i];
            this.removeItem(item, fieldPath.split('.'));
        }
        return item;
    };
    /**
     * This method should be called on data item before saving them to Dynamo. It removes all black listed and readonly
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    DynamoHandler.prototype.scrubDataForWrite = function (item) {
        item = this.scrubDataForRead(item);
        for (var _i = 0, _a = this.readonlyFields; _i < _a.length; _i++) {
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
    /**
     * Retrieve the data from the request for a POST or a PUT. You may override this method if the data needs to be
     * altered in any way before being saved to the DynamoDB table.
     * @throws BadRequestError
     * @return {any}
     */
    DynamoHandler.prototype.getBodyData = function () {
        var data = this.request.getBodyAsJSON();
        return data;
    };
    /**
     * Create a new entry in the DynamoDB table
     * @return {Promise<void>} [description]
     */
    DynamoHandler.prototype.create = function () {
        var _this = this;
        // Get the data we want to save
        var data = this.getBodyData();
        data = this.scrubDataForWrite(data);
        return this.getSingleKey(true).then(function (key) {
            // We get a new key and merge the results with the existing data
            Object.assign(data, key);
            return _this.itemValidation(data);
        }).then(function () {
            // Augment our data with some interesting bits of info
            return _this.preCreation(data);
        }).then(function (augmentedData) {
            data = augmentedData;
            // Do the Putting.
            var params = {
                TableName: _this.table,
                Item: data,
                ConditionExpression: 'attribute_not_exists(id)'
            };
            return _this.getDocumentClient().put(params).promise();
        }).then(function (response) {
            // Send the new item back to the client
            return _this.formatResult(data);
        }).then(function (data) {
            _this.response.setStatusCode(201).setBody(data).send();
            return Promise.resolve();
        });
    };
    /**
     * Update an existing entry in the DynamoDB table.
     * @return {Promise<void>} [description]
     */
    DynamoHandler.prototype.update = function () {
        var _this = this;
        // Get the data we want to save
        var data = this.getBodyData();
        data = this.scrubDataForWrite(data);
        var old;
        var key;
        return this.getSingleKey().then(function (itemKey) {
            key = itemKey;
            // We get a new key and merge the results with the existing data
            Object.assign(data, key);
            return _this.itemValidation(data);
        }).then(function () {
            return _this.fetchOldData(key);
        }).then(function (oldData) {
            old = oldData;
            // Augment our data with some interesting bits of info
            return _this.preUpdate(data, old);
        }).then(function (augmentedData) {
            data = augmentedData;
            // Do the Putting.
            var params = {
                TableName: _this.table,
                Item: data,
                ConditionExpression: 'attribute_exists(id)'
            };
            return _this.getDocumentClient().put(params).promise();
        }).then(function (response) {
            // Send the new item back to the client
            return _this.formatResult(data);
        }).then(function (data) {
            _this.response.setStatusCode(200).setBody(data).send();
            return Promise.resolve();
        });
    };
    /**
     * Delete an entry from the DynamoDB table.
     * @return {Promise<void>}
     */
    DynamoHandler.prototype.delete = function () {
        var _this = this;
        // Get the data we want to save
        return this.getSingleKey().then(function (key) {
            // Delete the entry
            var params = {
                TableName: _this.table,
                Key: key
            };
            return _this.getDocumentClient().delete(params).promise();
        }).then(function (response) {
            // Send an empty response to the smelly client.
            _this.response.setStatusCode(204).send();
            return Promise.resolve();
        });
    };
    /**
     * Validate the data for a POST or PUT request. Validation should be returned via a Promise Rejection, ideally with
     * a Validation Error. You may override this method to customize your validation. Validation rules can be provided
     * via `itemValidationSchema` as well.
     *
     * For creation request, the data will have a unique key assign to it so you.
     *
     * @param {any} data Data to validate
     * @return {Promise<void>}
     */
    DynamoHandler.prototype.itemValidation = function (data) {
        var result = JOI.validate(data, JOI.object().keys(this.itemValidationSchema()));
        if (result.error) {
            return Promise.reject(new Errors_1.ValidationError(result.error.details));
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Return a JOI Schema for validating the items that will added or updated in the DynamoDB table.
     * @return {JOI.SchemaMap}
     */
    DynamoHandler.prototype.itemValidationSchema = function () {
        var schemaMap = {
            id: JOI.string().required()
        };
        return schemaMap;
    };
    /**
     * This method is called just before creating an item in the table and after the item has passed validation. You can
     * override it to augment the data that will be store in the database. e.g.: By adding a creation timestamp or a
     * created by field.
     * @param  {any}           data [description]
     * @return {Promise<any>}      [description]
     */
    DynamoHandler.prototype.preCreation = function (data) {
        return Promise.resolve(data);
    };
    /**
     * This method is called just before updating an item in the table and after the item has passed validation. You can
     * override it to augment the data that will be store in the database. e.g.: By adding a updated at timestamp or a
     * updated by field.
     *
     * The default behavior is to merge the old data into the new one.
     *
     * @param  {any}           data New data that's about to be saved to Dynamo
     * @param  {any}           old  Fields from the current record as retrieved by `fetchOldData`
     * @return {Promise<void>}      [description]
     */
    DynamoHandler.prototype.preUpdate = function (data, old) {
        data = extend(true, data, old);
        return Promise.resolve(data);
    };
    /**
     * Retrieve some fields from a current record. The list of fieldss returned is defined via `onUpdateMergeFields`.
     * @param  {DynamoDB.Key} key
     * @return {Promise<any>}
     */
    DynamoHandler.prototype.fetchOldData = function (key) {
        if (this.onUpdateMergeFields.length == 0) {
            return Promise.resolve({});
        }
        var param = {
            TableName: this.table,
            Key: key,
            ProjectionExpression: this.onUpdateMergeFields.join(',')
        };
        return this.getDocumentClient().get(param).promise()
            .then(function (results) {
            if (results.Item) {
                return Promise.resolve(results.Item);
            }
            else {
                return Promise.reject(new Errors_1.NotFoundError);
            }
        });
    };
    return DynamoHandler;
}(AbstractHandler_1.AbstractHandler));
exports.DynamoHandler = DynamoHandler;
//# sourceMappingURL=/var/www/LambdaHandler/src/Handlers/DynamoHandler.js.map