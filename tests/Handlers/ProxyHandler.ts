import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Hello', () => {
    it('World', () => {
        assert.equal(1, 1);
    });
})
