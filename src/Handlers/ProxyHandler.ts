import { APIGatewayEvent, Context, ProxyCallback } from 'aws-lambda';
import { AbstractHandler } from './AbstractHandler';
import { ProxyHandlerConfig } from '../Config/ProxyHandlerConfig';
import { Request } from '../Request';
import { Response } from '../Response';
import { ValidationError, NotFoundError, MethodNotAllowedError } from '../Errors';
import * as JOI from 'joi';
import * as Https from 'https';
import * as Http from 'http';
import { HttpVerb } from '../HttpVerb'

const DEFAULT_CONFIG: ProxyHandlerConfig = {
    remotePath: '/',
    pathParameterName: 'path',
    ssl: true,
    processOptionsLocally: true,
    whiteListedHeader: new Array<string>()
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
        if (!this.config.remotePort) {
            this.config.remotePort = this.config.ssl ? 443 : 80;
        }

    }

    public process(request:Request, response:Response): Promise<void> {

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
    protected buildProxyOptions(): Promise<Https.RequestOptions> {
        let options: Https.RequestOptions = {
            host: this.getRemoteHost(),
            port: this.getRemotePort(),
            path: this.getRequestRemotePath(),
            method: this.request.getMethod,
            headers: {}
        };

        return Promise.resolve(options);
    }

    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemoteHost(): string {
        return this.remoteHost;
    }

    /**
     * Return the remote host where the request should be directed. Defaults to returning the remote host has defined
     * in the constructor. Can be overriden to adjust the remote host on the fly.
     */
    protected getRemotePort(): number {
        return this.config.remotePort;
    }

    /**
     * Build the Path of the remote request. This method can be overriden to alter where the request are directed.
     */
    protected getRequestRemotePath(): string {
        return (this.config.remotePath.match(/^\//) ? '' : '/') +   // Add slash if remote path doesn't start with one
            this.config.remotePath +
            (this.config.remotePath.match(/\/$/) ? '' : '/') +      // Add slash if remote path doesn't end with one
            this.request.data.pathParameters[this.config.pathParameterName];
    }

    protected getMethod(): HttpVerb {
        return this.request.getMethod();
    }

}
