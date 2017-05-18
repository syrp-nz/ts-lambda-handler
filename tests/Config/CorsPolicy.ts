import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import { fakeEvent } from '../FakeEvent';

const assert = chai.assert;

describe('Config.CorsPolicy', () => {

    it( 'headers', () => {
        let policy: Lib.Config.CorsPolicy;
        let rule: Lib.Config.CorsPolicyRule = {};
        let headers: {[key:string]: string};

        let request = new Lib.Request(fakeEvent);

        // Test empty Cors Policy
        policy = new Lib.Config.CorsPolicy(rule);
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isNotOk(headers['Access-Control-Allow-Origin']);

        // Test policy with a single domain and no matching origin
        rule.allowedOrigins = ['valid.com'];
        policy = new Lib.Config.CorsPolicy(rule);
        request.data.headers['origin'] = 'https://invalid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com');

        // Test policy with a single domain and matching origin
        request.data.headers['origin'] = 'https://valid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com');


        // Test policy with a multiple domain and no matching origin
        rule.allowedOrigins = ['valid.com', 'www.valid.com', 'valid.net'];
        policy = new Lib.Config.CorsPolicy(rule);
        request.data.headers['origin'] = 'https://invalid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'https://invalid.com');

        // Test policy with a multiple domain and matching origin
        request.data.headers['origin'] = 'https://valid.com/abc.html'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.com');

        request.data.headers['origin'] = 'https://www.valid.com/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://www.valid.com');

        request.data.headers['origin'] = 'https://valid.net/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'https://valid.net');

        // Test policy with matching domain, but HTTP dissallowed
        request.data.headers['origin'] = 'http://valid.net/'
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');

        // Test policy with matching domain, but HTTP explicitely dissallowed
        rule.allowHttp = false;
        policy = new Lib.Config.CorsPolicy(rule);
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');


        // Test policy with matching domain, and HTTP allowed
        rule.allowHttp = true;
        policy = new Lib.Config.CorsPolicy(rule);
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.equal(headers['Access-Control-Allow-Origin'], 'http://valid.net');


        // Test policy with matching values defined for allowed headers
        delete rule.allowHttp;
        rule.allowedHeaders = ['content-type', 'origin', 'x-special'];
        policy = new Lib.Config.CorsPolicy(rule);
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], 'content-type,origin,x-special');
        assert.equal(headers['Access-Control-Allow-Methods'], '*');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');


        // Test policy with matching values defined for allowed methods
        delete rule.allowedHeaders;
        rule.allowedMethods = ['POST', 'GET'];
        policy = new Lib.Config.CorsPolicy(rule);
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*');
        assert.equal(headers['Access-Control-Allow-Methods'], 'POST,GET');
        assert.isOk(headers['Access-Control-Allow-Origin']);
        assert.notEqual(headers['Access-Control-Allow-Origin'], 'http://valid.net');


        // Test a policy with all values define
        rule = {
            allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['x-origin', 'x-framework', 'authorization'],
            allowedOrigins: ['example.com', 'example.net', 'www.example.org'],
            allowHttp: true
        };
        policy = new Lib.Config.CorsPolicy(rule);
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
