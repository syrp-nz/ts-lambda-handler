import { Buffer } from 'buffer';
import { KMS, Lambda } from 'aws-sdk';

declare const process: any;

/**
 * This files contains a few generic utility functions that don't necesarely belong to any specific class
 */

/**
 * Decrypts an encrypted variables from `process.env` and stores the decrypted value in a different variable.
 * @param  {string}        cipherVarName    Name of the variable in `process.env` containing the encypted text.
 * @param  {string}        decryptedVarName Name of the variable in `process.env` that will contain the decypted value.
 *                                          If not provided, the original `cipherVarName` will be overridden with the
 *                                          new value.
 * @param  {string}        encoding         Encoding used by cipherVarName. Defaults to base64.
 * @return {Promise<void>} Promise that will resolve once the decryption is done.
 */
export function decryptEnvVar(
    cipherVarName: string,
    decryptedVarName:string = '',
    encoding:string = ''
    ): Promise<void> {

    // Make sure our Encrypted variable exists.
    if (process.env[cipherVarName] == undefined) {
        throw new Error(cipherVarName + " is not a valid process variable.");
    }

    // If we don't specify a output variable name, then we'll just override the original value.
    if (!decryptedVarName) {
        decryptedVarName = cipherVarName;
    }

    // If we don't specify an encdoging default to base 64.
    if (!encoding) {
        encoding = 'base64'
    }

    // Build the parameters for our KMS request.
    const params: KMS.DecryptRequest = {
        CiphertextBlob: new Buffer(process.env[cipherVarName], encoding)
    };

    // Do the decryption.
    const kms = new KMS();
    return kms.decrypt(params).promise().then((data: KMS.DecryptResponse) => {
        // Store the decrypted value.
        process.env[decryptedVarName] = data.Plaintext.toString();
        return Promise.resolve();
    });

};

/**
 * Print a message if the `LAMBDA_HANDLER_DEBUG` flag is set on `process.env`.
 * @param {any} message [description]
 */
export function print_debug(message:any):void {
    if (process && process.env && process.env.LAMBDA_HANDLER_DEBUG) {
        if (typeof message == 'string') {
            console.log(message);
        } else {
            console.dir(message);
        }
    }
}

/**
 * Returns true if the script is running in a testing context.
 * @return {boolean}
 */
export function isInTestingMode(): boolean {
    return process.env.LOADED_MOCHA_OPTS != undefined && process.env.LOADED_MOCHA_OPTS;
}

/**
 * Received a Lambda Invoke Result object and determines if it should be considered an error.
 *
 * Because our handlers attempts to mimic an HTTP request, they are designed to report errors with valid HTTP
 * responses. Lambda doesn't consider these error response as errors because the Lambda function exit normally.
 *
 * If the handler doesn't return any payload or if the handler's response didn't specify a status code, we'll assume
 * the function completed normally
 *
 * @param {Lambda.InvocationResponse} response
 * @return {boolean}
 */
export function validateLambdaInvokeResponse(response: Lambda.InvocationResponse): boolean {

    // Lambda itself says the function failed
    if (response.StatusCode >= 400 || (response.FunctionError != undefined && response.FunctionError != '')) {
        return false;
    }

    // Try to see if our response has a payload
    if (response.Payload) {
        try {
            // Let's try to parse the response payload as JSON.
            const payload = JSON.parse(response.Payload.toString());

            // If there's no status code or if the status code is below 400, we cosnider the response to be a success
            return payload.statusCode == undefined || payload.statusCode < 400;
        } catch (error) {
            // Can't convert the payload to JSON, will assume the request complete normally but didn't output JSON.
        }
    }

    return true;
}
