"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
var aws_sdk_1 = require("aws-sdk");
var AmazonResourceName_1 = require("./AmazonResourceName");
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
function decryptEnvVar(cipherVarName, decryptedVarName, encoding) {
    if (decryptedVarName === void 0) { decryptedVarName = ''; }
    if (encoding === void 0) { encoding = ''; }
    // Make sure our Encrypted variable exists.
    if (process.env[cipherVarName] == undefined) {
        throw new Error(cipherVarName + " is not a valid process variable.");
    }
    // If we don't specify a output variable name, then we'll just override the original value.
    if (!decryptedVarName) {
        decryptedVarName = cipherVarName;
    }
    // AWS Lambda will cache some environement variable between executions.
    // Check if the Decrypted flag for the current var has been set for DECRYPTED_ENV_VAR
    var decryptedVars = [];
    if (process.env.DECRYPTED_ENV_VAR != undefined) {
        decryptedVars = process.env.DECRYPTED_ENV_VAR.split(',');
        if (decryptedVars.indexOf(decryptedVarName) !== -1) {
            return Promise.resolve();
        }
    }
    else {
        process.env.DECRYPTED_ENV_VAR = '';
    }
    // If we don't specify an encdoging default to base 64.
    if (!encoding) {
        encoding = 'base64';
    }
    // Build the parameters for our KMS request.
    var params = {
        CiphertextBlob: new buffer_1.Buffer(process.env[cipherVarName], encoding)
    };
    // Do the decryption.
    var kms = new aws_sdk_1.KMS();
    return kms.decrypt(params).promise().then(function (data) {
        // Store the decrypted value.
        process.env[decryptedVarName] = data.Plaintext.toString();
        // Set the DECRYPTED_ENV_VAR flag with the decryptedVarName
        decryptedVars = process.env.DECRYPTED_ENV_VAR.split(',');
        decryptedVars.push(decryptedVarName);
        process.env.DECRYPTED_ENV_VAR = decryptedVars.join(',');
        return Promise.resolve();
    });
}
exports.decryptEnvVar = decryptEnvVar;
;
function encryptVar(plaintext, key, encoding) {
    if (encoding === void 0) { encoding = ''; }
    var params = {
        KeyId: AmazonResourceName_1.AmazonResourceName.normalize(key).toString(),
        Plaintext: plaintext
    };
    // If we don't specify an encdoging default to base 64.
    if (!encoding) {
        encoding = 'base64';
    }
    var kms = new aws_sdk_1.KMS();
    return kms.encrypt(params).promise().then(function (data) {
        var cipher = data.CiphertextBlob.toString(encoding);
        return Promise.resolve(cipher);
    });
}
exports.encryptVar = encryptVar;
/**
 * Print a message if the `LAMBDA_HANDLER_DEBUG` flag is set on `process.env`.
 * @param {any} message [description]
 */
function print_debug(message) {
    if (process && process.env && process.env.LAMBDA_HANDLER_DEBUG) {
        if (typeof message == 'string') {
            console.log(message);
        }
        else {
            console.dir(message);
        }
    }
}
exports.print_debug = print_debug;
/**
 * Returns true if the script is running in a testing context.
 * @return {boolean}
 */
function isInTestingMode() {
    return process.env.LOADED_MOCHA_OPTS != undefined && process.env.LOADED_MOCHA_OPTS;
}
exports.isInTestingMode = isInTestingMode;
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
function validateLambdaInvokeResponse(response) {
    // Lambda itself says the function failed
    if (response.StatusCode >= 400 || (response.FunctionError != undefined && response.FunctionError != '')) {
        return false;
    }
    // Try to see if our response has a payload
    if (response.Payload) {
        try {
            // Let's try to parse the response payload as JSON.
            var payload = JSON.parse(response.Payload.toString());
            // If there's no status code or if the status code is below 400, we cosnider the response to be a success
            return payload.statusCode == undefined || payload.statusCode < 400;
        }
        catch (error) {
            // Can't convert the payload to JSON, will assume the request complete normally but didn't output JSON.
        }
    }
    return true;
}
exports.validateLambdaInvokeResponse = validateLambdaInvokeResponse;
//# sourceMappingURL=/var/www/LambdaHandler/src/Utilities/Functions.js.map