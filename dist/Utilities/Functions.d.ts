import { Lambda } from 'aws-sdk';
import { ArnOrString } from './AmazonResourceName';
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
export declare function decryptEnvVar(cipherVarName: string, decryptedVarName?: string, encoding?: string): Promise<void>;
export declare function encryptVar(plaintext: string, key: ArnOrString, encoding?: string): Promise<string>;
/**
 * Print a message if the `LAMBDA_HANDLER_DEBUG` flag is set on `process.env`.
 * @param {any} message [description]
 */
export declare function print_debug(message: any): void;
/**
 * Returns true if the script is running in a testing context.
 * @return {boolean}
 */
export declare function isInTestingMode(): boolean;
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
export declare function validateLambdaInvokeResponse(response: Lambda.InvocationResponse): boolean;
