import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
import { DynamoDB } from 'aws-sdk';
import { ValidationError } from '../Errors/ValidationError';
import * as JOI from 'joi';
import { Map } from '../Map';

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
     * The search index that will be used for the general listing GET request. Leave blank if you want to use the default index.
     */
    protected searchIndex:string = '';

    protected expressionAttributeNames: Map<string> = {};
    protected expressionAttributeValues: Map<any> = {};


    public process(request:Request, response:Response): Promise<void> {
        switch (request.getMethod()) {
            case "GET":
                if (request.getResourceId()) {

                } else {
                    return this.search();
                }
                break;
            case "OPTIONS":
                response.send();
                break;
        }
    }

    protected search(): Promise<void> {
        return this.searchValidation().then(() => {
            const param = this.initSearch();

            const client = new DynamoDB.DocumentClient();
            return client.query(param).promise()
                .then((results) => this.formatSearchResult(results))
                .then((formattedResults) => {
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

    protected searchValidationSchema(): JOI.SchemaMap {
        const schemaMap: JOI.SchemaMap = {
            limit: JOI.number().integer().min(0).max(150)
        }
        return schemaMap;
    }

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

        return params;
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
        results.Items.forEach((item) => {this.scrubData(item)});
        delete results.Count;
        delete results.ScannedCount;
        return Promise.resolve(results);
    }

    /**
     * Remove all black listed fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubData(item:any): any {
        for (let fieldPath of this.blacklistedFields) {
            this.removeItem(item, fieldPath.split('.'));
        }

        return item;
    }

    /**
     * Recursive method that remove the given property as defined by the path from the item.
     * @param  {any}      item
     * @param  {string[]} path
     */
    protected removeItem(item:any, path:string[]) {
        const fieldName = path.shift();
        if (item[fieldName]) {
            if (path.length == 0) {
                delete item[fieldName];
            } else {
                this.removeItem(item[fieldName], path);
            }
        }
    }

}
