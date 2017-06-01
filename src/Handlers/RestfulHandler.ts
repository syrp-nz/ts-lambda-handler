import { ProxyHandler, APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
import { MethodNotAllowedError } from '../Errors';
import { ObjectMap, HttpVerbs } from '../Types';
import * as extend from 'extend';

/**
 * An Handler to implement a REST endpoint.
 */
export abstract class RestfulHandler extends AbstractHandler {

    public process(request:Request, response:Response): Promise<void> {
        let p: Promise<void>;
        const isSingle = this.isSingleRequest();

        // Dispatch the request to the appropriate function based on HTTP verb used.
        switch (request.getMethod()) {
            case HttpVerbs.GET:
                if (isSingle) {
                    // Getting a specific record
                    p = this.retrieveSingle();
                } else {
                    // Searching a list of records
                    p = this.search();
                }
                break;
            case HttpVerbs.POST:
                if (!isSingle) {
                    // creating a new record
                    p = this.create();
                }
                break;
            case HttpVerbs.PUT:
                if (isSingle) {
                    // Updating an existing record
                    p = this.update();
                }
                break;
            case HttpVerbs.DELETE:
                if (isSingle) {
                    // Deleting a specific record.
                    p = this.delete();
                }
                break;
            case HttpVerbs.OPTIONS:
                p = this.preflight();
                break;
        }

        if (p == undefined) {
            p = Promise.reject(new MethodNotAllowedError);
        }

        return p;
    }

    /**
     * Determine if the request is for a specific entry. e.g.: retriving, updating, deleteing a specific record.
     *
     * When a request is meant to return a list of results or create a brand new record the function should return
     * false.
     */
    protected abstract isSingleRequest(): boolean;

    /**
     * Retrive a specific item from its ID. e.g.: `GET resource/123.json`
     * @return {Promise<void>}
     */
    protected abstract retrieveSingle(): Promise<void>;

    /**
     * Retrieve a list of results
     * @return {Promise<void>}
     */
    protected abstract search(): Promise<void>;

    /**
     * Create a new entry
     */
    protected abstract create(): Promise<void>;

    /**
     * Update an existing entry.
     */
    protected abstract update(): Promise<void>;

    /**
     * Delete an entry.
     */
    protected abstract delete(): Promise<void>;

    /**
     * Respond to a preflight (OPTIONS) request. Used to return CORS headers.
     */
    protected preflight(): Promise<void> {
        this.response.send();
        return Promise.resolve();
    }

}
