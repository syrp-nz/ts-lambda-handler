import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import { fakeEvent } from '../FakeEvent';

const assert = chai.assert;

describe('Config.CorsPolicy', () => {

    let policy: Lib.Config.CorsPolicy;
    let headers: {[key:string]: string};
    let request = new Lib.Request(fakeEvent);

    beforeEach(() => {
        policy = null;
        headers = null;
    });

    it( 'Empty Cors Policy', () => {
        policy = new Lib.Config.CorsPolicy({});
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    });

    it( 'Policy with single domain and no matching origin', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com']
        });
        request.data.headers['origin'] = 'https://invalid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    })

    it('policy with a single domain and matching origin', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com']
        });
        request.data.headers['origin'] = 'https://valid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com');

    });

    it('policy with a single domain, weird port and matching origin', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com:8080']
        });
        request.data.headers['origin'] = 'https://valid.com:8080/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com:8080');

    });

    it('policy with a single domain, weird port and matching origin domain, but wrong port', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com:80']
        });
        request.data.headers['origin'] = 'https://valid.com:443/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    });

    it('policy with a single domain without port and matching origin domain but port', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com']
        });
        request.data.headers['origin'] = 'https://valid.com:80/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    });

    it('policy with a single domain, weird port and matching origin domain no port', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com:8080']
        });
        request.data.headers['origin'] = 'https://valid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    });

    it('policy with a multiple domain and no matching origin', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net']
        });
        request.data.headers['origin'] = 'https://invalid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isUndefined(headers['Access-Control-Allow-Origin']);
    });

    it('policy with a multiple domain and matching origin', () => {
        request.data.headers['origin'] = 'https://valid.com/abc.html'
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net']
        });
        headers = policy.headers(request);

        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com');

        request.data.headers['origin'] = 'https://www.valid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://www.valid.com');

        request.data.headers['origin'] = 'https://valid.net/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.net');

        // Test policy with matching domain, but HTTP dissallowed
        request.data.headers['origin'] = 'http://valid.net/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with matching domain, but HTTP explicitely dissallowed', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowHttp: false
        });
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');

    });

    it('policy with matching domain, and HTTP allowed', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowHttp: true
        });
        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with matching values defined for allowed headers', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowedHeaders: ['content-type', 'origin', 'x-special']
        });

        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], 'content-type,origin,x-special');
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with a wildcard allowed headers', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowedHeaders: '*'
        });

        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.isUndefined(headers['Access-Control-Allow-Methods']);
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with matching values defined for allowed methods', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowedMethods: ['POST', 'GET']
        });

        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.equal(headers['Access-Control-Allow-Methods'], 'POST,GET');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with wildcard allowed methods', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedOrigins: ['valid.com', 'www.valid.com', 'valid.net'],
            allowedMethods: '*'
        });

        headers = policy.headers(request);
        assert.ok(headers);
        assert.isUndefined(headers['Access-Control-Allow-Headers']);
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');
    });

    it('policy with all values define', () => {
        policy = new Lib.Config.CorsPolicy({
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['x-origin', 'x-framework', 'authorization'],
            allowedOrigins: ['example.com', 'example.net', 'www.example.org'],
            allowHttp: true
        });
        headers = policy.headers(request);
        request.data.headers['origin'] = 'http://www.example.org/subfolder?q=test';
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], 'x-origin,x-framework,authorization');
        assert.equal(headers['Access-Control-Allow-Methods'], 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'http://www.example.org');
    });
});
