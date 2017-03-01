import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../index';
import { CorsPolicyRule } from '../../Config/CorsPolicyRule';
import { fakeEvent } from '../FakeEvent';

const assert = chai.assert;



describe('Config.CorsPolicy', () => {

    it( 'headers', () => {
        let policy: Lib.Config.CorsPolicy;
        let headers: {[key:string]: string};

        let request = new Lib.Request(fakeEvent);

        policy = new Lib.Config.CorsPolicy({});
        headers = policy.headers(request);
        assert.ok(headers);
        assert.equal(headers['Access-Control-Allow-Headers'], '*')
        assert.equal(headers['Access-Control-Allow-Methods'], '*')
        assert.isNotOk(headers['Access-Control-Allow-Origin'])

    });

});
