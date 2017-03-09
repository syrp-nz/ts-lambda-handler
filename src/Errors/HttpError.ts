/**
 * Represent an HTTP Error to return to the client. `Response` can convert this error to the appropriate ProxyResponse.
 */
export class HttpError extends Error {

    /**
     * If this is set to true the error should be reported back to the client.
     * @type {boolean}
     */
    passthrough:boolean = true;

    constructor(public message, public statusCode: number = 500, public body = null) {
        super(message);
    }

}
