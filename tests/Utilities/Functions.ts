import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src';
import { Lambda } from 'aws-sdk';
import 'mocha';

let assert = chai.assert;


describe('Utilities.Functions', () => {

    describe('validateLambdaInvokeResponse', () => {
        const fn = Lib.Utilities.Functions.validateLambdaInvokeResponse;
        const response: Lambda.InvocationResponse = {
            StatusCode: 200
        }

        it('Successfull empty response with no Function Error', () => {
            assert(fn(response));
            response.StatusCode = 202;
            assert(fn(response))
            response.StatusCode = 204;
            assert(fn(response))
            response.StatusCode = 201;
            assert(fn(response))
            response.FunctionError = '';
            assert(fn(response))
        });

        it('Unsuccessfull empty response with no Function Error', () => {
            delete response.FunctionError
            response.StatusCode = 400;
            assert.isFalse(fn(response))
            response.StatusCode = 401;
            assert.isFalse(fn(response))
            response.StatusCode = 500;
            assert.isFalse(fn(response))
            response.FunctionError = '';
            assert.isFalse(fn(response))
        });

        it('Unsuccessfull with Function Error', () => {
            response.FunctionError = 'Handled';
            response.StatusCode = 200;

            assert.isFalse(fn(response));
            response.StatusCode = 202;
            assert.isFalse(fn(response))
            response.StatusCode = 204;
            assert.isFalse(fn(response))
            response.StatusCode = 201;
            assert.isFalse(fn(response))
            response.StatusCode = 400;
            assert.isFalse(fn(response))
            response.StatusCode = 403;
            assert.isFalse(fn(response))
            response.StatusCode = 500;
            assert.isFalse(fn(response))

            response.FunctionError = 'Unhandled';
            response.StatusCode = 200;

            assert.isFalse(fn(response));
            response.StatusCode = 202;
            assert.isFalse(fn(response))
            response.StatusCode = 204;
            assert.isFalse(fn(response))
            response.StatusCode = 201;
            assert.isFalse(fn(response))
            response.StatusCode = 403;
            assert.isFalse(fn(response))
            response.StatusCode = 500;
            assert.isFalse(fn(response))
        });

        it('Successfull with valid payloads', () => {
            delete response.FunctionError;
            response.StatusCode = 200;
            response.Payload = 'OK';
            assert(fn(response));
            response.Payload = 'Error!';
            assert(fn(response));
            response.FunctionError = '';
            response.StatusCode = 201;
            response.Payload = '{}';
            assert(fn(response));
            response.Payload = '<xml><statusCode>400</statusCode></xml>';
            assert(fn(response));
            response.Payload = JSON.stringify({foo:"bar"});
            assert(fn(response));
            response.Payload = JSON.stringify({statusCode: 200});
            assert(fn(response));
            response.Payload = JSON.stringify({statusCode: 201});
            assert(fn(response));
            response.Payload = JSON.stringify({statusCode: 204});
            assert(fn(response));
            response.Payload = JSON.stringify({statusCode: '200'});
            assert(fn(response));
        });

        it('Unsuccessfull with an error payload', () => {
            response.Payload = JSON.stringify({statusCode: 400});
            assert.isFalse(fn(response));
            response.Payload = JSON.stringify({statusCode: 404});
            assert.isFalse(fn(response))
            delete response.FunctionError;
            response.Payload = JSON.stringify({statusCode: 403});
            assert.isFalse(fn(response))
            response.Payload = JSON.stringify({statusCode: 500});
            assert.isFalse(fn(response))
            response.Payload = JSON.stringify({statusCode: 502});
            assert.isFalse(fn(response))
            response.Payload = JSON.stringify({statusCode: '502'});
            assert.isFalse(fn(response))
        });
    });
});
