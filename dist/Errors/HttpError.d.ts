/**
 * Represent an HTTP Error to return to the client. `Response` can convert this error to the appropriate ProxyResponse.
 */
export declare class HttpError extends Error {
    message: any;
    statusCode: number;
    body: any;
    /**
     * If this is set to true the error should be reported back to the client.
     * @type {boolean}
     */
    passthrough: boolean;
    constructor(message: any, statusCode?: number, body?: any);
}
