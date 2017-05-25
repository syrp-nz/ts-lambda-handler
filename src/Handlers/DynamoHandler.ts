import { ProxyHandler, APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
import { DynamoDB } from 'aws-sdk';
import { ValidationError, NotFoundError, MethodNotAllowedError } from '../Errors';
import * as JOI from 'joi';
import { Map } from '../Types';
import * as uuid from 'uuid/v4';
import * as extend from 'extend';

/**
 * An Handler to implement a REST endpoint for a Dynamo table.
 */
export abstract class DynamoHandler extends AbstractHandler {

    /**
     * Table associated to the request
     */
    protected abstract table:string;

    /**
     * Index to use when searching for results. If left blank search will be executed against the main table.
     */
    protected indexName:string = undefined;

    /**
     * The default number of results to return.
     */
    protected defaultLimit:number = 20;

    /**
     * The default list of fields to return. If left empty, all projected fields will be return.
     */
    protected defaultFields:string[] = [];

    /**
     * Those fields will never be returned to the client. Fields you might want to include here could be a salt or a
     * password hash. You definitely don't need to include a password field in here, because you are a good developer
     * who always hash passwords using a one-way cryptographically strong hashing algorithm and would never consider
     * for the life of them storing plain text password.
     *
     * Values may be provdied using a dot notation. e.g.: topObject.childrenObject.propertyToRemove
     */
    protected blacklistedFields:string[] = [];

    /**
     * These fields can be outputed back to the client on read request, but will be purge from creation/update request.
     */
    protected readonlyFields:string[] = [];

    /**
     * List of field to retrieve and merge with update statements. If defined this will cause the update function to
     * fetch a few fields from the existing record and merge them with the new value that will be put in the table.
     *
     * This can be helpfull to preserve attributes that the client can not modify directly, but that must still be
     * retained. e.g.: creation date
     */
    protected onUpdateMergeFields:string[] = [];

    /**
     * What operation to use when performing the search.
     */
    protected searchOperation: "scan" | "query" = "query";

    protected expressionAttributeNames: Map<string>;
    protected expressionAttributeValues: Map<any>;

    /**
     * Instance of Document Client use to communicate with DynamoDB.
     * @type {DynamoDB.DocumentClient}
     */
    private docClient: DynamoDB.DocumentClient;

    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): Promise<void> {
        return super.init(event,context,callback).then(() => {
            // Those values should be unique for each request. So we instanciate them here.
            this.expressionAttributeNames = {};
            this.expressionAttributeValues = {};
        });
    }


    public process(request:Request, response:Response): Promise<void> {
        let p: Promise<void>;

        switch (request.getMethod()) {
            case "GET":
                if (this.isSingleRequest()) {
                    p = this.retrieveSingle();
                } else {
                    p = this.search();
                }
                break;
            case "POST":
                if (this.isSingleRequest()) {
                    p = Promise.reject(new MethodNotAllowedError);
                } else {
                    p = this.create();
                }
                break;
            case "PUT":
                if (this.isSingleRequest()) {
                    p = this.update();
                } else {
                    p = Promise.reject(new MethodNotAllowedError);
                }
                break;
            case "DELETE":
                if (this.isSingleRequest()) {
                    p = this.delete();
                } else {
                    p = Promise.reject(new MethodNotAllowedError);
                }
                break;
            case "OPTIONS":
                response.send();
                p = Promise.resolve();
                break;
            default:
                p = Promise.reject(new MethodNotAllowedError);
        }

        return p;
    }

    /**
     * Provide an instance of DocumentClient to communicate with DynamoDB.
     * @return {DynamoDB.DocumentClient} [description]
     */
    protected getDocumentClient(): DynamoDB.DocumentClient {
        if (!this.docClient) {
            this.docClient = new DynamoDB.DocumentClient;
        }

        return this.docClient;
    }

    /**
     * Analyze the request and detects if the request is for a specific entry. e.g.: retriving, updating, deleteing a
     * specific record.
     *
     * This method assumes you are using an id path parameter for this purpose. You may override it if your set up is
     * different.
     *
     * @return {boolean}
     */
    protected isSingleRequest(): boolean {
        return this.request.getResourceId() != '';
    }

    /**
     * Retrive a specific item from the DynamoDB table.
     * @return {Promise<void>}
     */
    protected retrieveSingle(): Promise<void> {
        return this.getSingleKey().then(key => {
            const param: DynamoDB.GetItemInput = {
                TableName: this.table,
                Key: key,
                ProjectionExpression: this.getProjectionExpression()
            };

            if (param.ProjectionExpression == '*' || param.ProjectionExpression == '') {
                delete param.ProjectionExpression;
            }

            return this.getDocumentClient().get(param).promise()
                .then((results: DynamoDB.GetItemOutput): Promise<void> => {
                    if (results.Item) {
                        return this.formatResult(results.Item);
                    } else {
                        return Promise.reject(new NotFoundError);
                    }
                }).then(data => {
                    this.response.setBody(data).send();
                    return Promise.resolve();
                });
        })

    }

    /**
     * Return a key suitable for retriveing, deleting or updating a single item in the Dynamo table.
     *
     * The basic function assumes your key uses an ID column, but you can override this function if your table uses a
     * different key.
     * @param {boolean} newEntry If this is set to true, a unique id will be generated. This is suitable for creting a
     *                           new entry
     * @return {Promise<DynamoDB.Key>}
     */
    protected getSingleKey(newEntry: boolean = false): Promise<DynamoDB.Key> {
        return Promise.resolve({'id': newEntry ? uuid() : this.request.getResourceId()});
    }

    /**
     * Search the DynamoDB table for records matchign the query.
     * @return {Promise<void>}
     */
    protected search(): Promise<void> {
        return this.searchValidation().then(() => {
            let p: Promise<any>;

            if (this.searchOperation == 'query') {
                p = this.getDocumentClient().query(this.initSearch()).promise();
            } else {
                p = this.getDocumentClient().scan(this.initScanRequest()).promise();
            }


            return p.then((results) => {
                return this.formatSearchResult(results);
            }).then((formattedResults) => {
                this.response.setBody(formattedResults).send();
                return Promise.resolve();
            });
        });
    }

    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]}
     */
    protected searchValidation(): Promise<void> {
        const result = JOI.validate(
            this.request.data.queryStringParameters,
            JOI.object().keys(this.searchValidationSchema())
        );
        if (result.error) {
            return Promise.reject(new ValidationError(result.error.details));
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Return a JOI Schema for validating the search request. You may override this function to add your own validation.
     * @return {JOI.SchemaMap}
     */
    protected searchValidationSchema(): JOI.SchemaMap {
        const schemaMap: JOI.SchemaMap = {
            limit: JOI.number().integer().min(0).max(150)
        }
        return schemaMap;
    }

    /**
     * Build the parameters for the Query request to DynamoDB
     * @return {DynamoDB.QueryInput} [description]
     */
    protected initSearch(): DynamoDB.QueryInput {
        const params: DynamoDB.QueryInput = {
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
    }

    protected initScanRequest(): DynamoDB.ScanInput {
        const params: DynamoDB.QueryInput = this.initSearch();
        if (params.FilterExpression) {
            params.FilterExpression = '(' + params.KeyConditionExpression + ') AND (' + params.FilterExpression + ')';
        } else {
            params.FilterExpression = params.KeyConditionExpression;
        }

        delete params.KeyConditionExpression;

        return params;
    }

    /**
     * Set the Select and ProjectionExpression field on a request.
     * @param  {DynamoDB.QueryInput} params
     * @return void
     */
    protected setProjectionOnRequest(params: DynamoDB.QueryInput): void {
        const projectionExp = this.getProjectionExpression();
        switch(projectionExp) {
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
    }

    /**
     * Get a value suitable for the Exclusive Start Key parameter when perfoming a search.
     */
    protected abstract getExclusiveStartKey(): Map<string|number>;

    /**
     * Get a value suitable for the Key Condition Expression parameter when perfoming a search.
     */
    protected getKeyConditionExpression(): string {
        return undefined;
    }

    /**
     * Get a value suitable for the Filter Expression parameter when perfoming a search.
     */
    protected getFilterExpression(): string {
        return undefined;
    }

    /**
     * Add an expression to the ExpressionAttributeNames list for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    protected addExpAttrName(key:string, value:string) {
        this.expressionAttributeNames[key] = value;
    }

    /**
     * Add an expression to the ExpressionAttributeValues attributes for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    protected addExpAttrValue(key:string, value:any) {
        this.expressionAttributeValues[key] = value;
    }

    /**
     * Define what field should be returned. This is controlled by the `defaultFields` property. If '*' is returned, all attributes will be returned. If the return value is empty, all projected attributes will be returned. If a comma seperated list of field is returned, only those fields will be returned.
     * @return {string}
     */
    protected getProjectionExpression(): string {
        if (this.defaultFields.length > 0) {
            return this.defaultFields.join(',');
        } else {
            return '';
        }
    }

    /**
     * Receives results from a Dynamo Query and format them so they are suitable for our purposes. Out of the box it
     * removes the count and scanned count values. It also calls scrubData to remove any black listed fields.
     *
     * Child object can override this method if they require further formatting of the output.
     * @param  {DynamoDB.QueryOutput} results [description]
     * @return {Promise<any>}                 [description]
     */
    protected formatSearchResult(results: DynamoDB.QueryOutput): Promise<any> {
        // Remove the counts
        delete results.Count;
        delete results.ScannedCount;

        // Format each item individually
        const promises:Promise<any>[] = [];
        for (let item of results.Items) {
            promises.push(this.formatResult(item));
        }

        return Promise.all(promises).then(() => Promise.resolve(results));
    }

    /**
     * Format an individual result item before it's returned to the client.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    private formatResult(item: any): Promise<any> {
        item = this.scrubDataForRead(item);
        return this.augmentData(item);
    }

    /**
     * This method is run for each item before it is being returned to the client. It can be overridden if to tweak
     * results sent to the client. e.g.: Add a calculated read only field.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    protected augmentData(item:any): Promise<any> {
        return Promise.resolve(item);
    }


    /**
     * This method should be called on data item before being returned to the client. It removes all black listed
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubDataForRead(item:any): any {
        for (let fieldPath of this.blacklistedFields) {
            this.removeItem(item, fieldPath.split('.'));
        }

        return item;
    }

    /**
     * This method should be called on data item before saving them to Dynamo. It removes all black listed and readonly
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubDataForWrite(item:any): any {
        item = this.scrubDataForRead(item);

        for (let fieldPath of this.readonlyFields) {
            this.removeItem(item, fieldPath.split('.'));
        }

        return item;
    }

    /**
     * Recursive method that remove the given property as defined by the path from the item.
     * @param  {any}      item
     * @param  {string[]} path
     */
    private removeItem(item:any, path:string[]) {
        const fieldName = path.shift();
        if (item[fieldName]) {
            if (path.length == 0) {
                delete item[fieldName];
            } else {
                this.removeItem(item[fieldName], path);
            }
        }
    }

    /**
     * Retrieve the data from the request for a POST or a PUT. You may override this method if the data needs to be
     * altered in any way before being saved to the DynamoDB table.
     * @throws BadRequestError
     * @return {any}
     */
    protected getBodyData(): any {
        let data = this.request.getBodyAsJSON();
        return data;
    }

    /**
     * Create a new entry in the DynamoDB table
     * @return {Promise<void>} [description]
     */
    protected create(): Promise<void> {
        // Get the data we want to save
        let data = this.getBodyData();
        data = this.scrubDataForWrite(data);

        return this.getSingleKey(true).then(key => {
            // We get a new key and merge the results with the existing data
            Object.assign(data, key);
            return this.itemValidation(data);
        }).then(() => {
            // Augment our data with some interesting bits of info
            return this.preCreation(data);
        }).then((augmentedData) => {
            data = augmentedData;
            // Do the Putting.
            const params: DynamoDB.PutItemInput = {
                TableName : this.table,
                Item: data,
                ConditionExpression: 'attribute_not_exists(id)'
            }

            return this.getDocumentClient().put(params).promise()
        }).then((response: DynamoDB.PutItemOutput) => {
            // Send the new item back to the client
            return this.formatResult(data);
        }).then((data) => {
            this.response.setStatusCode(201).setBody(data).send();
            return Promise.resolve();
        })
    }

    /**
     * Update an existing entry in the DynamoDB table.
     * @return {Promise<void>} [description]
     */
    protected update(): Promise<void> {
        // Get the data we want to save
        let data:any = this.getBodyData();
        data = this.scrubDataForWrite(data);

        let old: any;
        let key: DynamoDB.Key;

        return this.getSingleKey().then(itemKey => {
            key = itemKey;
            // We get a new key and merge the results with the existing data
            Object.assign(data, key);
            return this.itemValidation(data);
        }).then(() => {
            return this.fetchOldData(key);
        }).then((oldData) => {
            old = oldData;
            // Augment our data with some interesting bits of info
            return this.preUpdate(data, old);
        }).then((augmentedData) => {
            data = augmentedData;

            // Do the Putting.
            const params: DynamoDB.PutItemInput = {
                TableName : this.table,
                Item: data,
                ConditionExpression: 'attribute_exists(id)'
            }

            return this.getDocumentClient().put(params).promise();
        }).then((response: DynamoDB.PutItemOutput) => {
            // Send the new item back to the client
            return this.formatResult(data);
        }).then((data) => {
            this.response.setStatusCode(200).setBody(data).send();
            return Promise.resolve();
        })
    }

    /**
     * Delete an entry from the DynamoDB table.
     * @return {Promise<void>}
     */
    protected delete(): Promise<void> {
        // Get the data we want to save
        return this.getSingleKey().then(key => {
            // Delete the entry
            const params: DynamoDB.DeleteItemInput = {
                TableName : this.table,
                Key: key
            };
            return this.getDocumentClient().delete(params).promise();
        }).then((response: DynamoDB.DeleteItemOutput) => {
            // Send an empty response to the smelly client.
            this.response.setStatusCode(204).send();
            return Promise.resolve();
        })
    }

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
    protected itemValidation(data: any): Promise<void> {
        const result = JOI.validate( data, JOI.object().keys(this.itemValidationSchema()) );
        if (result.error) {
            return Promise.reject(new ValidationError(result.error.details));
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Return a JOI Schema for validating the items that will added or updated in the DynamoDB table.
     * @return {JOI.SchemaMap}
     */
    protected itemValidationSchema(): JOI.SchemaMap {
        const schemaMap: JOI.SchemaMap = {
            id: JOI.string().required().guid()
        }
        return schemaMap;
    }

    /**
     * This method is called just before creating an item in the table and after the item has passed validation. You can
     * override it to augment the data that will be store in the database. e.g.: By adding a creation timestamp or a
     * created by field.
     * @param  {any}           data [description]
     * @return {Promise<any>}      [description]
     */
    protected preCreation(data: any): Promise<any> {
        return Promise.resolve(data);
    }

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
    protected preUpdate(data: any, old:any): Promise<any> {
        data = extend(true, data, old);
        return Promise.resolve(data);
    }

    /**
     * Retrieve some fields from a current record. The list of fieldss returned is defined via `onUpdateMergeFields`.
     * @param  {DynamoDB.Key} key
     * @return {Promise<any>}
     */
    protected fetchOldData(key: DynamoDB.Key): Promise<any> {
        if (this.onUpdateMergeFields.length == 0) {
            return Promise.resolve({});
        }

        const param: DynamoDB.GetItemInput = {
            TableName: this.table,
            Key: key,
            ProjectionExpression: this.onUpdateMergeFields.join(',')
        };

        return this.getDocumentClient().get(param).promise()
            .then((results: DynamoDB.GetItemOutput) => {
                if (results.Item) {
                    return Promise.resolve(results.Item);
                } else {
                    return Promise.reject(new NotFoundError);
                }
            });
    }

}
