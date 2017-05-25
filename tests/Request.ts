import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../src/index';
import { fakeEvent as fakeEventSource } from './FakeEvent';
import * as JOI from 'joi';
import * as lambda from 'aws-lambda';

let fakeEvent: lambda.APIGatewayEvent = JSON.parse(JSON.stringify(fakeEventSource));

function cloner<T>(original: T): T {
    return JSON.parse(JSON.stringify(original));
}

const assert = chai.assert;

describe('Request', () => {
    let clone = cloner(fakeEvent)
    let request = new Lib.Request(clone);


    it('constructor');

    it('getBodyAsJSON');

    it( 'data', () => {
        assert.strictEqual(request.data, clone);
    });

    it( 'originalData', () => {
        assert.deepEqual(request.originalData, fakeEvent);
    });

    it( 'getHeader', () => {
        assert.equal(request.getHeader('UPPER'), 'CASE');
        assert.equal(request.getHeader('upper'), 'CASE');
        assert.equal(request.getHeader('lower'), 'case');
        assert.equal(request.getHeader('LOWER'), 'case');
        assert.equal(request.getHeader('miXed'), 'cAsE');
        assert.equal(request.getHeader('MIxED'), 'cAsE');
        assert.equal(request.getHeader('doesnotexist'), '');
        assert.equal(request.getHeader('limit', '20'), '20');
    });

    it( 'getQueryStringParameter', () => {
        assert.equal(request.getQueryStringParameter('key1'), 'value');
        assert.equal(request.getQueryStringParameter('KEY1'), 'value');
        assert.equal(request.getQueryStringParameter('HeLLo'), 'world');
        assert.equal(request.getQueryStringParameter('hEllO'), 'world');
        assert.equal(request.getQueryStringParameter('FOO'), 'BAR');
        assert.equal(request.getQueryStringParameter('foo'), 'BAR');
        assert.equal(request.getQueryStringParameter('doesnotexist'), '');
        assert.equal(request.getQueryStringParameter('limit', '20'), '20');
    });

    it( 'getStageVariable', () => {
        assert.equal(request.getStageVariable('key1'), 'value');
        assert.equal(request.getStageVariable('KEY1'), '');
        assert.equal(request.getStageVariable('HeLLo'), 'world');
        assert.equal(request.getStageVariable('hEllO'), '');
        assert.equal(request.getStageVariable('FOO'), 'BAR');
        assert.equal(request.getStageVariable('foo'), '');
        assert.equal(request.getStageVariable('doesnotexist'), '');
        assert.equal(request.getStageVariable('limit', '20'), '20');
    });

    it ('getContentType', () => {
        fakeEvent.headers['content-type'] = 'text/plain';
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), 'text/plain');

        fakeEvent.headers['content-type'] = undefined;
        fakeEvent.headers['Content-Type'] = 'text/html';
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), 'text/html');

        fakeEvent.headers['Content-Type'] = undefined;
        request = new Lib.Request(fakeEvent);
        assert.equal(request.getContentType(), '');
    });

    it ('validateQueryString', () => {
        request = new Lib.Request(fakeEvent);
        // { key1: 'value', hello: 'world', foo: 'BAR' }
        return request.validateQueryString({
            'key1': JOI.string().required(),
            'hello': JOI.string().required(),
            'foo':  JOI.string().required(),
            'optional': JOI.string(),
        }).catch((error) => {
            // Test a valid schema,
            assert(false, 'Valid schema returns error');
        }).then(() => {
            // This will throw an error because `key1` is missing.
            return request.validateQueryString({
                'hello': JOI.string().required(),
                'foo':  JOI.string().required()
            })
        }).then(() => {
            assert(false, 'Invalid schema does not return error');
        }).catch((error) => {
            if (error.message != 'ValidationError') {
                throw error;
            }
        });
    });

});
