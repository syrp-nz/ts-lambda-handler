import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as chaiAsPromised from 'chai-as-promised';
import { fakeContext, fakeEvent, fakeHandlerCallback } from '../FakeEvent';
import * as Sinon from 'sinon';
import { Buffer } from 'buffer';
import * as HttpRequest from 'request';
import * as http from 'http';

chai.use(chaiAsPromised);
const assert = chai.assert;

let handler: StraightProxyHandler;

describe('ProxyHandler', () => {

    beforeEach(() => {
        handler = new StraightProxyHandler();
    });

    it('getRemoteHost()', () => handler.getRemoteHostTest() );

    it('getRemotePort()', () => handler.getRemoteHostTest());

    it('getRemoteBaseUrl()', () => handler.getRemoteHostTest());

    it('getRemotePath()', () => handler.getRemotePathTest() );

    it('getMethod()', () => handler.getMethodTest() );

    it('getRemoteHeaders()', () => handler.getRemoteHeadersTest() );

    it('getQueryStringParameters()', () => handler.getQueryStringParametersTest() );

    it('getRemoteBody()', () => handler.getRemoteBodyTest() );

    it('processOptionsLocally set to true', () => handler.processOptionsLocallyTest() );

    it('processOptionsLocally set to false', () => handler.processOptionsRemotlyTest() );

    it('buildProxyOptions', () => handler.buildProxyOptionsTest() );

    it('buildProxyOptions with explicit options', () => handler.buildProxyOptionsTestExplicit() );

    it('processResponse', () => handler.processResponseTest() );

    it('proxyRequest success', () => handler.proxyRequestSuccessTest() );

    it('proxyRequest failure', () => handler.proxyRequestFailureTest() );

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

        // this.config.pathParameterName = 'path';
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

    processOptionsLocallyTest() {
        Sinon.stub(this, 'getMethod').callsFake(() => 'OPTIONS');
        const requestSpy = Sinon.spy(this, 'proxyRequest');
        this.config.processOptionsLocally = true;

        return this.process(this.request, this.response).then(() => {
            assert.isTrue(this.response.sent, 'Response should be sent after the handler is done handling the OPTIONS request');
            assert(requestSpy.notCalled, 'No remote request should occur on OPTIONS request set to be process locally');
            this.getMethod['restore']();
            this.proxyRequest['restore']();
        });
    }

    processOptionsRemotlyTest() {
        Sinon.stub(this, 'getMethod').callsFake(() => 'OPTIONS');
        const requestStub = Sinon.stub(this, 'proxyRequest').callsFake(() => Promise.resolve({
            message: {
                statusCode: 200,
                headers: {}
            },
            body: ''
        }));
        this.config.processOptionsLocally = false;

        return this.process(this.request, this.response).then(() => {
            assert.isTrue(this.response.sent, 'Response should be sent after the handler is done handling the OPTIONS request');
            assert(requestStub.called, 'A Remote request should have occured.');
            this.getMethod['restore']();
            this.proxyRequest['restore']();
        });
    }

    buildProxyOptionsTest() {
        return this.buildProxyOptions().then((options) => {
            assert.deepEqual(options, {
                port: 443,
                url: 'https://example.com/fake/path',
                method: fakeEvent.httpMethod,
                headers: {},
                qs: this.request.data.queryStringParameters,
                body: fakeEvent.body,
                strictSSL: true
            }, 'Options mismatch when using default config.');
        });
    }

    buildProxyOptionsTestExplicit() {
        this.config.baseUrl = 'different/base/url';
        this.config.pathParameterName = 'id';
        this.config.port = 8080;
        this.config.ssl = false;
        this.config.whiteListedHeaders = ['Content-Type'];

        return this.buildProxyOptions().then((options) => {
            assert.deepEqual(options, {
                port: 8080,
                url: 'http://example.com/different/base/url/123456789',
                method: fakeEvent.httpMethod,
                headers: {'Content-Type': 'application/json'},
                qs: this.request.data.queryStringParameters,
                body: fakeEvent.body,
            }, 'Options mismatch when using default config.');
        });
    }

    processResponseTest() {
        const msg: any = {statusCode: 418, headers: {'content-type': 'application/text'}};
        const body = "I'm a tea pot";
        return this.processResponse(msg, body).then(() => {
            assert.equal(this.response.statusCode, 418);
            assert.deepEqual(this.response.headers, {}, 'By default no response header should be whitelisted.')
            assert.deepEqual(this.response.body, body);

            return this.processResponse(msg, new Buffer(body));
        }).then(() => {
            assert.deepEqual(this.response.body, body);

            this.config.whiteListedResponseHeaders = ['Content-Type', 'non-header'];
            return this.processResponse(msg, body);
        }).then(() => {
            assert.lengthOf(Object.keys(this.response.headers), 1);
            for (let key in this.response.headers) {
                assert.equal(key.toLowerCase(), 'content-type');
            }
        });
    }

    proxyRequestSuccessTest() {
        Sinon.stub(this, 'httpRequest').callsFake(this.mockHttpRequest);
        return this.proxyRequest(this.mockProxyOption()).then((response: Lib.Types.ProxyResponse) => {
            assert.isOk(response);
            assert.isOk(response.body);
            assert.isOk(response.message);
            this.httpRequest['restore']();
        });
    }

    proxyRequestFailureTest() {
        Sinon.stub(this, 'httpRequest').callsFake(this.mockHttpRequestFailure);
        return assert.isRejected(
            this.proxyRequest(this.mockProxyOption()),
            /BadGatewayError/,
            "proxyRequest should return a rejected promise with a bad gateway error."
        ).then(() => { this.httpRequest['restore']() });
    }

    mockProxyOption() {
        return {
            port: 443,
            url: 'https://example.com/fake/path',
            method: fakeEvent.httpMethod,
            headers: {},
            qs: this.request.data.queryStringParameters,
            body: fakeEvent.body,
            strictSSL: true
        };
    }


    mockHttpRequest = (
        options:HttpRequest.Options,
        callback: {(error: any, incomingMessage: http.IncomingMessage, response: string|Buffer): void}
    ) => {
        const incomingMessage: any = {
            statusCode: 418,
            headers: {
                'content-type': 'application/json',
                'Cache-Control': 'max-age=60',
            }
        }

        callback(null, incomingMessage, 'I\'m a tea pot.');
    }

    mockHttpRequestFailure = (
        options:HttpRequest.Options,
        callback: {(error: any, incomingMessage: http.IncomingMessage, response: string|Buffer): void}
    ) => {
        const incomingMessage: any = {
            statusCode: 418,
            headers: {
                'content-type': 'application/json',
                'Cache-Control': 'max-age=60',
            }
        }

        callback(new Error('Server is on holiday'), null, null);
    }
}
