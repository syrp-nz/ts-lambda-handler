import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
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
     * These fields can be outputed back to the client on read request, but will be purge from creation/update request.
     */
    protected readonlyFields: string[];
    /**
     * List of field to retrieve and merge with update statements. If defined this will cause the update function to
     * fetch a few fields from the existing record and merge them with the new value that will be put in the table.
     *
     * This can be helpfull to preserve attributes that the client can not modify directly, but that must still be
     * retained. e.g.: creation date
     */
    protected onUpdateMergeFields: string[];
    /**
     * What operation to use when performing the search.
     */
    protected searchOperation: "scan" | "query";
    protected expressionAttributeNames: Map<string>;
    protected expressionAttributeValues: Map<any>;
    /**
     * Instance of Document Client use to communicate with DynamoDB.
     * @type {DynamoDB.DocumentClient}
     */
    private docClient;
    protected init(event: APIGatewayEvent, context: Context, callback: ProxyCallback): Promise<void>;
    process(request: Request, response: Response): Promise<void>;
    /**
     * Provide an instance of DocumentClient to communicate with DynamoDB.
     * @return {DynamoDB.DocumentClient} [description]
     */
    protected getDocumentClient(): DynamoDB.DocumentClient;
    /**
     * Analyze the request and detects if the request is for a specific entry. e.g.: retriving, updating, deleteing a
     * specific record.
     *
     * This method assumes you are using an id path parameter for this purpose. You may override it if your set up is
     * different.
     *
     * @return {boolean}
     */
    protected isSingleRequest(): boolean;
    /**
     * Retrive a specific item from the DynamoDB table.
     * @return {Promise<void>}
     */
    protected retrieveSingle(): Promise<void>;
    /**
     * Return a key suitable for retriveing, deleting or updating a single item in the Dynamo table.
     *
     * The basic function assumes your key uses an ID column, but you can override this function if your table uses a
     * different key.
     * @param {boolean} newEntry If this is set to true, a unique id will be generated. This is suitable for creting a
     *                           new entry
     * @return {Promise<DynamoDB.Key>}
     */
    protected getSingleKey(newEntry?: boolean): Promise<DynamoDB.Key>;
    /**
     * Search the DynamoDB table for records matchign the query.
     * @return {Promise<void>}
     */
    protected search(): Promise<void>;
    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]}
     */
    protected searchValidation(): Promise<void>;
    /**
     * Return a JOI Schema for validating the search request. You may override this function to add your own validation.
     * @return {JOI.SchemaMap}
     */
    protected searchValidationSchema(): JOI.SchemaMap;
    /**
     * Build the parameters for the Query request to DynamoDB
     * @return {DynamoDB.QueryInput} [description]
     */
    protected initSearch(): DynamoDB.QueryInput;
    protected initScanRequest(): DynamoDB.ScanInput;
    /**
     * Set the Select and ProjectionExpression field on a request.
     * @param  {DynamoDB.QueryInput} params
     * @return void
     */
    protected setProjectionOnRequest(params: DynamoDB.QueryInput): void;
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
     * Format an individual result item before it's returned to the client.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    private formatResult(item);
    /**
     * This method is run for each item before it is being returned to the client. It can be overridden if to tweak
     * results sent to the client. e.g.: Add a calculated read only field.
     * @param  {any}          item [description]
     * @return {Promise<any>}      [description]
     */
    protected augmentData(item: any): Promise<any>;
    /**
     * This method should be called on data item before being returned to the client. It removes all black listed
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubDataForRead(item: any): any;
    /**
     * This method should be called on data item before saving them to Dynamo. It removes all black listed and readonly
     * fields from the item.
     * @param  {any} item
     * @return {any}
     */
    protected scrubDataForWrite(item: any): any;
    /**
     * Recursive method that remove the given property as defined by the path from the item.
     * @param  {any}      item
     * @param  {string[]} path
     */
    private removeItem(item, path);
    /**
     * Retrieve the data from the request for a POST or a PUT. You may override this method if the data needs to be
     * altered in any way before being saved to the DynamoDB table.
     * @throws BadRequestError
     * @return {any}
     */
    protected getBodyData(): any;
    /**
     * Create a new entry in the DynamoDB table
     * @return {Promise<void>} [description]
     */
    protected create(): Promise<void>;
    /**
     * Update an existing entry in the DynamoDB table.
     * @return {Promise<void>} [description]
     */
    protected update(): Promise<void>;
    /**
     * Delete an entry from the DynamoDB table.
     * @return {Promise<void>}
     */
    protected delete(): Promise<void>;
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
    protected itemValidation(data: any): Promise<void>;
    /**
     * Return a JOI Schema for validating the items that will added or updated in the DynamoDB table.
     * @return {JOI.SchemaMap}
     */
    protected itemValidationSchema(): JOI.SchemaMap;
    /**
     * This method is called just before creating an item in the table and after the item has passed validation. You can
     * override it to augment the data that will be store in the database. e.g.: By adding a creation timestamp or a
     * created by field.
     * @param  {any}           data [description]
     * @return {Promise<any>}      [description]
     */
    protected preCreation(data: any): Promise<any>;
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
    protected preUpdate(data: any, old: any): Promise<any>;
    /**
     * Retrieve some fields from a current record. The list of fieldss returned is defined via `onUpdateMergeFields`.
     * @param  {DynamoDB.Key} key
     * @return {Promise<any>}
     */
    protected fetchOldData(key: DynamoDB.Key): Promise<any>;
}
