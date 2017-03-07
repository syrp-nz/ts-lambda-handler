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

    protected indexName:string = undefined;

    protected defaultLimit:number = 20;

    /**
     * The search index that will be used for the general listing GET request. Leave blank if you want to use the default index.
     */
    protected searchIndex:string = '';

    protected expressionAttributeNames: Map<string> = {};
    protected expressionAttributeValues: Map<any> = {};


    public process(request:Request, response:Response) {
        switch (request.getMethod()) {
            case "GET":
                if (request.getResourceId()) {

                } else {
                    this.search();
                }
            case "OPTIONS":
                response.send();
                break;
        }
    }

    protected search() {
        this.searchValidation();
        const param = this.initSearch();

        const client = new DynamoDB.DocumentClient();
        client.query(param).promise().then(this.formatSearchResult);
    }

    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]} [description]
     */
    protected searchValidation() {
        const result = JOI.validate(
            this.request.data.queryStringParameters,
            JOI.object().keys(this.searchValidationSchema())
        );
        if (result.error) {
            throw new ValidationError(result.error.details);
        }
    }

    protected searchValidationSchema(): JOI.SchemaMap {
        const schemaMap: JOI.SchemaMap = {
            limit: JOI.number().integer().min(0).max(150)
        }
        return schemaMap;
    }

    protected initSearch(): DynamoDB.QueryInput {
        return {
            TableName: this.table,
            Limit: parseInt(this.request.getQueryStringParameter('limit', this.defaultLimit.toString())),
            IndexName: this.indexName,
            KeyConditionExpression: this.getKeyConditionExpression(),
            FilterExpression: this.getFilterExpression(),
            ExpressionAttributeNames: this.expressionAttributeNames,
            ExpressionAttributeValues: this.expressionAttributeValues
        };
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

    protected addExpAttrName(key:string, value:string) {
        this.expressionAttributeNames[key] = value;
    }

    protected addExpAttrValue(key:string, value:any) {
        this.expressionAttributeValues[key] = value;
    }

    protected formatSearchResult(results: DynamoDB.QueryOutput) {
        this.response.setBody(results).send();
    }

}
