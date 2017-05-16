import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { AbstractHandler } from './AbstractHandler';
import { ProxyHandlerConfig } from '../Config/ProxyHandlerConfig';
import { Request } from '../Request';
import { Response } from '../Response';
import { ValidationError, NotFoundError, MethodNotAllowedError, BadGatewayError } from '../Errors';
import * as JOI from 'joi';

import * as NodeRequest from 'request';
import { Map, HttpVerb, ProxyResponse } from '../Types';
import * as http from 'http';


const DEFAULT_CONFIG: ProxyHandlerConfig = {
    baseUrl: '/',
    pathParameterName: 'path',
    ssl: true,
    processOptionsLocally: true,
    whiteListedHeader: new Array<string>(),
}

/**
 * An handler to relay a request through a proxy.
 */
export class ProxyHandler extends AbstractHandler {

    /**
     * Instanciate the Proxy Handler
     * @param  {string}         remoteHost Host where the requests will be rerouted
     * @param  {string}         remotePath Remote path where the request will be rerouted.
     * @param  {string}         pathParameterName Name of the Path Parameter on the AWS request object
     * @param  {HandlerConfig}  config
     * @param  {boolean}        processOptionsLocally Whatever OPTIONS request should be process locally or relayed to
     *                                                the remote host
     */
    constructor(
        protected remoteHost:string,
        protected config:ProxyHandlerConfig = {}
    ) {
        super(config);
        this.config = Object.assign(DEFAULT_CONFIG, config);
        if (!this.config.port) {
            this.config.port = this.config.ssl ? 443 : 80;
        }

    }

    public process(request:Request, response:Response): Promise<void> {
        return this.buildProxyOptions()
            .then(options => this.proxyRequest(options))
            .then(proxyResponse => {

            });

    }


    /**
     * Perform an HTTP/HTTPS request.
     * @param  {NodeRequest.Options}    options [description]
     * @return {Promise<ProxyResponse>}         [description]
     */
    protected proxyRequest(options:NodeRequest.Options): Promise<ProxyResponse> {
        return new Promise<ProxyResponse>((resolve, reject) => {
            NodeRequest(options, (error: any, incomingMessage: http.IncomingMessage, response: string|Buffer) => {
                if (error) {
                    console.error(error);
                    reject(new BadGatewayError());
                } else {
                    resolve({message: incomingMessage, body: response});
                }
            })
        })
    }

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
    protected buildProxyOptions(): Promise<NodeRequest.Options> {
        let options: NodeRequest.Options = {
            host: this.getRemoteHost(),
            port: this.getRemotePort(),
            baseUrl: this.getRemoteBaseUrl(),
            url: this.getRemotePath(),
            method: this.getMethod(),
            headers: this.getRemoteHeaders(),
            qs: this.getQueryStringParameters(),
        };

        if (this.config.ssl) {
            options.strictSSL = true;
        }

        return Promise.resolve(options);
    }

    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemoteHost(): string {
        return `http${this.config.ssl ? 's' : ''}://${this.remoteHost}`;
    }

    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemotePort(): number {
        return this.config.port;
    }

    /**
     * Build the Path of the remote request. This method can be overriden to alter where the request are directed.
     */
    protected getRemoteBaseUrl(): string {
        return (this.config.baseUrl.match(/^\//) ? '' : '/') +   // Add slash if remote path doesn't start with one
            this.config.baseUrl +
            (this.config.baseUrl.match(/\/$/) ? '' : '/');       // Add slash if remote path doesn't end with one

    }

    /**
     * [getRemotePath description]
     * @return {string} [description]
     */
    protected getRemotePath(): string {
        return this.request.getPathParameter[this.config.pathParameterName];
    }

    /**
     * Get the HTTP method to use to communicate with the proxy.
     * @return {HttpVerb} [description]
     */
    protected getMethod(): HttpVerb {
        return this.request.getMethod();
    }

    /**
     * Build a list of headers that should be attached to the proxy request. The default behavior is to return all white
     * listed headers from the original request.
     *
     * This method can also be overriden to provide a custom list of headers.
     */
    protected getRemoteHeaders(): Map<string> {
        const headers: Map<string> = {};

        this.config.whiteListedHeader.forEach((header) => {
            headers[header.toLowerCase()] = this.request.getHeader(header);
        });

        return headers;
    }

    /**
     * Return the query string parameter that will be added to the proxy request.
     */
    protected getQueryStringParameters(): Map<string> {
        return this.request.data.queryStringParameters;
    }

}
