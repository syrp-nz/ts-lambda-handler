import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as JWT from 'jsonwebtoken';
import { fakeEvent } from '../FakeEvent'

const assert = chai.assert;
const secret = 'abc123';
const payload = {
    foo: 'bar',
    user: {
        uid: 'abc123',
        details: {
            name: 'John Galt',
            email: 'john.galt@atlas.shrugged'
        },
    },
    scopes: 'read_books,write_books'
};
const attrMap = {
    id: 'user.uid',
    name: 'user.details.name',
    email: 'user.details.email',
}
const validSig = JWT.sign(payload, secret);
const invalidSig = JWT.sign(payload, secret + 'hello');


describe('Authorizers.JWTAuthorizer', () => {

    const auth = new Lib.Authorizers.JWTAuthorizer(secret, attrMap);

    it('getUser:Anonymous', () => {
        return auth.getUser(new Lib.Request(fakeEvent)).then((user) => {
            assert.isOk(user);
            assert.isTrue(user.anonymous);
        });
    });

    it('getUser:ValidUser', () => {
        fakeEvent.headers['authorization'] = 'Bearer ' + validSig;
        return auth.getUser(new Lib.Request(fakeEvent)).then((user) => {
            assert.isOk(user);
            assert.isFalse(user.anonymous);
            assert.equal(user.id, payload.user.uid);
            assert.equal(user.name, payload.user.details.name);
            assert.equal(user.email, payload.user.details.email);
            assert.equal(user.scopes, payload.scopes);
            assert.isNotOk(user.first_name);
            assert.isNotOk(user.last_name);
        });
    });

    it('getUser:InvalidUser', () => {
        fakeEvent.headers['authorization'] = 'Bearer ' + invalidSig;
        return auth.getUser(new Lib.Request(fakeEvent)).then((user) => {
            assert(false, '`getUser` should throw an error when provided with an invalid signature.');
        }).catch((error) => {
            if (error.message != 'UnauthorizedError') {
                return Promise.reject(error);
            }
        });
    });

    it('getUser:Invalid Auth Type', () => {
        fakeEvent.headers['authorization'] = 'Basic ' + validSig;
        return auth.getUser(new Lib.Request(fakeEvent)).then((user) => {
            assert(false, '`getUser` should throw an error when trying to authenticated with Basic Auth.');
        }).catch((error) => {
            if (error.message != 'UnauthorizedError') {
                return Promise.reject(error);
            }
        });
    });

    it('getUser:Empty Bearer token', () => {
        fakeEvent.headers['authorization'] = 'Bearer    ';
        return auth.getUser(new Lib.Request(fakeEvent)).then((user) => {
            assert(false, '`getUser` should throw an error when trying to login with an empty token.');
        }).catch((error) => {
            if (error.message != 'UnauthorizedError') {
                return Promise.reject(error);
            }
        });
    });

    it('isAuthorised:Anonymous', () => {
        delete fakeEvent.headers['authorization'];
        const request = new Lib.Request(fakeEvent);
        return auth.getUser(request).then((user) => {
            return auth.isAuthorised(request, user)
        }).then(() => {
            assert(false, '`isAuthorised` should throw a ForbiddenError when provided with an anonymous user.');
        }).catch((error) => {
            if (error.message != 'ForbiddenError') {
                return Promise.reject(error);
            }
        });
    });


    it('isAuthorised:ValidUser', () => {
        fakeEvent.headers['authorization'] = 'Bearer ' + validSig;
        const request = new Lib.Request(fakeEvent);
        return auth.getUser(request).then((user) => {
            return auth.isAuthorised(request, user)
        });
    });

    it('isAuthorised:Anonymous OPTIONS request', () => {
        delete fakeEvent.headers['authorization'];
        fakeEvent.httpMethod = 'OPTIONS';
        const request = new Lib.Request(fakeEvent);
        return auth.getUser(request).then((user) => {
            return auth.isAuthorised(request, user)
        })
    });

});
