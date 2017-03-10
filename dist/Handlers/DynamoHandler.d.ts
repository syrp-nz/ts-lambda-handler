import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
import { DynamoDB } from 'aws-sdk';
import * as JOI from 'joi';
import { Map } from '../Map';
/**
 * An Handler to implement a REST endpoint for a Dynamo table.
 */
export declare abstract class DynamoHandler extends AbstractHandler {
    /**
     * Table associated to the request
     */
    protected abstract table: string;
    /**
     * Index to use when searching for results. If left blank search will be executed against the main table.
     */
    protected indexName: string;
    /**
     * The default number of results to return.
     */
    protected defaultLimit: number;
    /**
     * The default list of fields to return. If left empty, all projected fields will be return.
     */
    protected defaultFields: string[];
    /**
     * Those fields will never be returned to the client. Fields you might want to include here could be a salt or a
     * password hash. You definitely don't need to include a password field in here, because you are a good developer
     * who always hash passwords using a one-way cryptographically strong hashing algorithm and would never consider
     * for the life of them storing plain text password.
     *
     * Values may be provdied using a dot notation. e.g.: topObject.childrenObject.propertyToRemove
     */
    protected blacklistedFields: string[];
    /**
     * The search index that will be used for the general listing GET request. Leave blank if you want to use the default index.
     */
    protected searchIndex: string;
    protected expressionAttributeNames: Map<string>;
    protected expressionAttributeValues: Map<any>;
    process(request: Request, response: Response): Promise<void>;
    protected search(): Promise<void>;
    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]}
     */
    protected searchValidation(): Promise<void>;
    protected searchValidationSchema(): JOI.SchemaMap;
    protected initSearch(): DynamoDB.QueryInput;
    /**
     * Get a value suitable for the Exclusive Start Key parameter when perfoming a search.
     */
    protected abstract getExclusiveStartKey(): Map<string | number>;
    /**
     * Get a value suitable for the Key Condition Expression parameter when perfoming a search.
     */
    protected getKeyConditionExpression(): string;
    /**
     * Get a value suitable for the Filter Expression parameter when perfoming a search.
     */
    protected getFilterExpression(): string;
    /**
     * Add an expression to the ExpressionAttributeNames list for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    protected addExpAttrName(key: string, value: string): void;
    /**
     * Add an expression to the ExpressionAttributeValues attributes for the Dynamo Request.
     * @param  {string} key
     * @param  {string} value
     */
    protected addExpAttrValue(key: string, value: any): void;
    /**
     * Define what field should be returned. This is controlled by the `defaultFields` property. If '*' is returned, all attributes will be returned. If the return value is empty, all projected attributes will be returned. If a comma seperated list of field is returned, only those fields will be returned.
     * @return {string}
     */
    protected getProjectionExpression(): string;
    /**
     * Receives results from a Dynamo Query and format them so they are suitable for our purposes. Out of the box it
     * removes the count and scanned count values. It also calls scrubData to remove any black listed fields.
     *
     * Child object can override this method if they require further formatting of the output.
     * @param  {DynamoDB.QueryOutput} results [description]
     * @return {Promise<any>}                 [description]
     */
    protected formatSearchResult(results: DynamoDB.QueryOutput): Promise<any>;
    /**
     * Remove all black listed fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubData(item: any): any;
    /**
     * Recursive method that remove the given property as defined by the path from the item.
     * @param  {any}      item
     * @param  {string[]} path
     */
    protected removeItem(item: any, path: string[]): void;
}
