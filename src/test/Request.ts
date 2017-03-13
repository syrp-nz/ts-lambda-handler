import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../index';
import { fakeEvent } from './FakeEvent';

const assert = chai.assert;

describe('Request', () => {
    let request = new Lib.Request(fakeEvent);

    it( 'data', () => {
        assert.strictEqual(request.data, fakeEvent);
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
    })

});
