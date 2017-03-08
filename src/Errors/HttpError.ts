/**
 * Represent an HTTP Error to return to the client. `Response` can convert this error to the appropriate ProxyResponse.
 */
export class HttpError extends Error {

    constructor(public message, public statusCode: number = 500, public body = null) {
        super(message);
    }

}
