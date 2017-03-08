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
            return client.query(param).promise().then((results) => this.formatSearchResult(results));
        });
    }

    /**
     * Validate the Query string for its suitability for a search request.
     * @return {[type]} [description]
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
            FilterExpression: this.getFilterExpression()
        };

        if (Object.keys(this.expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = this.expressionAttributeNames;
        }

        if (Object.keys(this.expressionAttributeValues).length > 0) {
            params.ExpressionAttributeValues = this.expressionAttributeValues;
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

    protected addExpAttrName(key:string, value:string) {
        this.expressionAttributeNames[key] = value;
    }

    protected addExpAttrValue(key:string, value:any) {
        this.expressionAttributeValues[key] = value;
    }

    protected formatSearchResult(results: DynamoDB.QueryOutput): Promise<void> {
        this.response.setBody(results).send();
        return Promise.resolve();
    }

}
