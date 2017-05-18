import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as chaiAsPromised from 'chai-as-promised';
import { fakeContext, fakeEvent, fakeHandlerCallback } from '../FakeEvent';

chai.use(chaiAsPromised);
const assert = chai.assert;

let handler: StraightProxyHandler;

describe('ProxyHandler', () => {

    beforeEach(() => {
        handler = new StraightProxyHandler();
    });

    it('getRemoteHost()', () => { handler.getRemoteHostTest(); });

    it('getRemotePort()', () => { handler.getRemoteHostTest(); });

    it('getRemoteBaseUrl()', () => { handler.getRemoteHostTest(); });

    it('getRemotePath()', () => { handler.getRemotePathTest(); });

    it('getMethod()', () => { handler.getMethodTest(); });

    it('getRemoteHeaders()', () => { handler.getRemoteHeadersTest(); });

    it('getQueryStringParameters()', () => { handler.getQueryStringParametersTest(); });

    it('getRemoteBody()', () => { handler.getRemoteBodyTest(); });


});

class StraightProxyHandler extends Lib.Handlers.ProxyHandler {

    constructor() {
        super('example.com', {});
        this.init(fakeEvent,fakeContext,fakeHandlerCallback);
    }

    getRemoteHostTest() {

        assert.equal(this.getRemoteHost(), 'https://example.com', 'Remote Host should default to HTTPS');

        this.config.ssl = false;
        assert.equal(this.getRemoteHost(), 'http://example.com', 'Remote host should use HTTP when `config.ssl` is false');

        this.config.ssl = true;
        assert.equal(this.getRemoteHost(), 'https://example.com', 'Remote host should use HTTPS when `config.ssl` is true');
    }


    getRemotePortTest() {
        assert.equal(this.getRemotePort(), this.config.port, 'getRemotHostPort() should return the same port as the config.');
    }

    getRemoteBaseUrlTest() {
        assert.equal(this.getRemoteBaseUrl(), '/', 'Base URL should default to /');

        this.config.baseUrl = 'hello'
        assert.equal(this.getRemoteBaseUrl(), '/hello/', 'getRemoteBaseUrl should autmatically had a / at the end and start of the base url');

        this.config.baseUrl = '/hello'
        assert.equal(this.getRemoteBaseUrl(), '/hello/', 'getRemoteBaseUrl should autmatically had a / at the end and start of the base url');

        this.config.baseUrl = 'hello/'
        assert.equal(this.getRemoteBaseUrl(), '/hello/', 'getRemoteBaseUrl should autmatically had a / at the end and start of the base url');

        this.config.baseUrl = '/hello/'
        assert.equal(this.getRemoteBaseUrl(), '/hello/', 'getRemoteBaseUrl should autmatically had a / at the end and start of the base url');


    }

    getRemotePathTest() {
        assert.equal(this.getRemotePath(), fakeEvent.pathParameters['path'], 'getRemotePath() shoudl default to returning that `path` attribute');

        this.config.pathParameterName = 'id';
        assert.equal(this.getRemotePath(), fakeEvent.pathParameters[this.config.pathParameterName], 'getRemotePath() should return the path attribut equal to `this.config.pathParameterName`');
    }

    getMethodTest() {
        assert.equal(this.getMethod(), fakeEvent.httpMethod, 'getMethod() should default to returning the request\'s method');
    }

    getRemoteHeadersTest() {
        let headers = this.getRemoteHeaders();
        assert.isOk(headers);
        assert.lengthOf(Object.keys(headers), 0, 'getRemoteHeaders() should return an empty object by default');

        this.config.whiteListedHeaders = ['Content-Type', 'Non-Header', 'x-shopify-shop-domain'];
        headers = this.getRemoteHeaders();

        assert.isOk(headers['x-shopify-shop-domain'], 'White listed headers should be returned if they are present on the request');
        assert.equal(headers['x-shopify-shop-domain'], fakeEvent.headers['x-shopify-shop-domain'], 'header value should match their value on the request.');

        console.dir(this.request.data.headers);
        console.dir(headers['Content-Type']);

        assert.isOk(headers['Content-Type'], 'White listed headers should be returned if they are present on the request regardless of case');
        assert.isNotOk(headers['Non-Header'], 'Headers that are not present on the request should not be returned.');

        assert.isNotOk(headers['x-shopify-test'], 'Headers that are not whitelisted should not be returned');
    }

    getQueryStringParametersTest() {
        assert.deepEqual(this.getQueryStringParameters(), this.request.data.queryStringParameters);
    }

    getRemoteBodyTest() {
        assert.equal(this.getRemoteBody(), this.request.data.body);
    }
}
