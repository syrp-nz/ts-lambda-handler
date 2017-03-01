/**
 * Represent an HTTP Error to return to the client. `Response` can convert this error to the appropriate ProxyResponse.
 */
export declare class HttpError extends Error {
    message: any;
    statusCode: number;
    constructor(message: any, statusCode?: number);
    body(): any;
}
