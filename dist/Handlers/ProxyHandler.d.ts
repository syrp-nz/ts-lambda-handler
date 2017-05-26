/// <reference types="request" />
/// <reference types="node" />
import { AbstractHandler } from './AbstractHandler';
import { ProxyHandlerConfig } from '../Config/ProxyHandlerConfig';
import { Request } from '../Request';
import { Response } from '../Response';
import * as HttpRequest from 'request';
import { ObjectMap, HttpVerb, ProxyResponse } from '../Types';
import * as http from 'http';
/**
 * An handler to relay a request through a proxy.
 */
export declare class ProxyHandler extends AbstractHandler {
    protected remoteHost: string;
    protected config: ProxyHandlerConfig;
    /**
     * Reference to the `request` module. We could call the module directly, but that make it more difficult to unit
     * test.
     */
    protected httpRequest: HttpRequest.RequestAPI<HttpRequest.Request, HttpRequest.CoreOptions, HttpRequest.RequiredUriUrl>;
    /**
     * Instanciate the Proxy Handler
     * @param  {string}         remoteHost Host where the requests will be rerouted
     * @param  {string}         remotePath Remote path where the request will be rerouted.
     * @param  {string}         pathParameterName Name of the Path Parameter on the AWS request object
     * @param  {HandlerConfig}  config
     * @param  {boolean}        processOptionsLocally Whatever OPTIONS request should be process locally or relayed to
     *                                                the remote host
     */
    constructor(remoteHost: string, config?: ProxyHandlerConfig);
    process(request: Request, response: Response): Promise<void>;
    /**
     * Perform an HTTP/HTTPS request.
     * @param  {NodeRequest.Options}    options [description]
     * @return {Promise<ProxyResponse>}         [description]
     */
    protected proxyRequest(options: HttpRequest.Options): Promise<ProxyResponse>;
    /**
     * Build the options for the request to the remove server. THis method can be overriden to customise the request.
     * By default:
     * * the host is read from the remote host pass to the constructor,
     * * the port defaults to 443,
     * * the path is determined from `requestRemotePath`,
     * * the method is read from original AWS request,
     * * the header fi
     *
     * @return {Promise<Https.RequestOptions>} [description]
     */
    protected buildProxyOptions(): Promise<HttpRequest.Options>;
    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemoteHost(): string;
    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemotePort(): number;
    /**
     * Build the Path of the remote request. This method can be overriden to alter where the request are directed.
     */
    protected getRemoteBaseUrl(): string;
    /**
     * [getRemotePath description]
     * @return {string} [description]
     */
    protected getRemotePath(): string;
    /**
     * Get the HTTP method to use to communicate with the proxy.
     * @return {HttpVerb} [description]
     */
    protected getMethod(): HttpVerb;
    /**
     * Build a list of headers that should be attached to the proxy request. The default behavior is to return all white
     * listed headers from the original request.
     *
     * This method can also be overriden to provide a custom list of headers.
     */
    protected getRemoteHeaders(): ObjectMap<string>;
    /**
     * Return the query string parameter that will be added to the proxy request.
     */
    protected getQueryStringParameters(): ObjectMap<string>;
    /**
     * Get the body of the proxy request as a string. Default behavior is to return the body of the original request.
     * @return {string}
     */
    protected getRemoteBody(): string;
    /**
     * Process a proxy response and update the Handler's response to match. This method can be overriden if the
     * Handler's response need to be modified in some way before being sent back to the client.
     * @param  {http.IncomingMessage} incomingMessage
     * @param  {string|Buffer}        response
     * @return {Promise<void>}
     */
    protected processResponse(incomingMessage: http.IncomingMessage, body: string | Buffer): Promise<void>;
}
