"use strict";
var buffer_1 = require("buffer");
var aws_sdk_1 = require("aws-sdk");
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
        return Promise.resolve();
    });
}
exports.decryptEnvVar = decryptEnvVar;
;
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
//# sourceMappingURL=/var/www/LambdaHandler/src/Utilities/Functions.js.map