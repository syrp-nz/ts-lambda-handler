import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as Lambda from 'aws-lambda';
import { fakeEvent } from '../FakeEvent';

const assert = chai.assert;

class TestHandler extends Lib.Handlers.NoopHandler {
    public testAuthorize() {
        it('authorize with valid user', () => {
            return this.authorize().then((data) => {
                assert.isTrue(data);
                assert.ok(this.user);
            });
        });

        it('authorize without valid user', () => {
            this.config.authorizer = new TestAuthorizer(true, false);
            return this.authorize().then(() => {
                assert(false, 'Should have receive a UnauthorizedError.')
            }).catch((error) => {
                if (error.message != 'UnauthorizedError') {
                    throw error;
                }
            });
        });

        it('authorize without access', () => {
            this.config.authorizer = new TestAuthorizer(false, true);
            return this.authorize().then(() => {
                assert(false, 'Should have receive a ForbiddenError.')
            }).catch((error) => {
                if (error.message != 'ForbiddenError') {
                    throw error;
                }
            });
        });

        it('authorize without an authorizer', () => {
            delete this.config.authorizer;
            this.user = null;

            return this.authorize().then((data) => {
                assert.isFalse(data);
                assert.isNotOk(this.user);
            })
        });
    }
}

class TestAuthorizer implements Lib.Authorizers.HandlerAuthorizer {

    constructor(public failUser: boolean, public failAuthorization: boolean) {};

    getUser(event) {
        if (this.failUser) {
            return Promise.reject(new Lib.Errors.UnauthorizedError());
        } else {
            return Promise.resolve({id: '123', anonymouse: false})
        }
    }

    isAuthorised(event) {
        if (this.failAuthorization) {
            return Promise.reject(new Lib.Errors.ForbiddenError());
        } else {
            return Promise.resolve();
        }
    }

}

describe('Handlers.AbstractHandler', () => {
    let handler: TestHandler = new TestHandler({authorizer: new TestAuthorizer(false, false)});
    handler.testAuthorize();



});
