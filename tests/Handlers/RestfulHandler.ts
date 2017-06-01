import {} from 'jasmine';
import * as chai from 'chai';
import * as Lib from '../../src/index';
import * as chaiAsPromised from 'chai-as-promised';
import { fakeContext, fakeEvent, fakeHandlerCallback } from '../FakeEvent';
import * as Sinon from 'sinon';


chai.use(chaiAsPromised);
const assert = chai.assert;

let handler: MockRestfulHandler;

describe('RestfulHandler', () => {

    beforeEach(() => {
        handler = new MockRestfulHandler();
    });

    it('Retrieving search results', () => handler.testSearch() );
    it('Retriving single item', () => handler.testGetOperation() );
    it('Update single item', () => handler.testUpdate() );
    it('Delete single item', () => handler.testDelete() );
    it('Create new item', () => handler.testCreate() );


    it('Delete none item', () => handler.testInvalidDelete() );
    it('Update none item', () => handler.testInvalidUpdate() );
    it('Create existing item', () => handler.testInvalidCreate() );

    it('Unsupported operation', () => handler.testInvalidVerb() );

    it('Option pre-flight request', () => handler.testOptionVerb() );




});

class MockRestfulHandler extends Lib.Handlers.RestfulHandler {

    constructor() {
        super({});
        this.init(fakeEvent,fakeContext,fakeHandlerCallback);
    }


    public testSearch() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.GET;
        return this.process(this.request, this.response)
            .then(() => { assert.equal(this.calledOps, 'search') });
    }

    public testGetOperation() {
        this.singleRequest = true;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.GET;
        return this.process(this.request, this.response).then(() => {
            assert.equal(this.calledOps, 'retrieveSingle');
        });
    }

    public testUpdate() {
        this.singleRequest = true;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.PUT;
        return this.process(this.request, this.response).then(() => {
            assert.equal(this.calledOps, 'update');
        });
    }

    public testCreate() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.POST;
        return this.process(this.request, this.response).then(() => {
            assert.equal(this.calledOps, 'create');
        });
    }

    public testDelete() {
        this.singleRequest = true;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.DELETE;
        return this.process(this.request, this.response).then(() => {
            assert.equal(this.calledOps, 'delete');
        });
    }

    public testInvalidDelete() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.DELETE;
        return assert.isRejected(this.process(this.request, this.response), /MethodNotAllowedError/);
    }

    public testInvalidCreate() {
        this.singleRequest = true;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.POST;
        return assert.isRejected(this.process(this.request, this.response), /MethodNotAllowedError/);
    }

    public testInvalidUpdate() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.PUT;
        return assert.isRejected(this.process(this.request, this.response), /MethodNotAllowedError/);
    }

    public testInvalidVerb() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.PATCH;
        return assert.isRejected(this.process(this.request, this.response), /MethodNotAllowedError/);
    }

    public testOptionVerb() {
        this.singleRequest = false;
        this.request.data.httpMethod = Lib.Types.HttpVerbs.OPTIONS;
        return this.process(this.request, this.response).then(() => {
            assert.isTrue(this.response.sent);
            assert.isNotOk(this.response.body);
        });
    }

    /**
     * MOCK IMPLEMENTATION
     */

    calledOps: string = '';

    public singleRequest: boolean = false;

    protected isSingleRequest(): boolean {
        return this.singleRequest;
    }

    protected retrieveSingle(): Promise<void> {
        return this.setCalledOps('retrieveSingle');
    }

    protected search(): Promise<void> {
        return this.setCalledOps('search');
    }

    protected create(): Promise<void> {
        return this.setCalledOps('create');
    }

    protected update(): Promise<void> {
        return this.setCalledOps('update');
    }

    protected delete(): Promise<void> {
        return this.setCalledOps('delete');
    }

    protected setCalledOps(ops:string): Promise<void> {
        this.calledOps = ops;
        this.response.send();
        return Promise.resolve();
    }

}
