import { HandlerConfig } from './HandlerConfig';
/**
 * Configuration settings for a Handler object.
 */
export interface ProxyHandlerConfig extends HandlerConfig {
    /**
     * Remote root path where the request will be redirected. Defaults to '/'. e.g.
     */
    baseUrl?: string;
    /**
     * Name of the Path Parameter on the AWS request that contains the path of the request. This will default to `path`
     * if not specified.
     */
    pathParameterName?: string;
    /**
     * Whatever the request should be handle over HTTPS. Default to true.
     */
    ssl?: boolean;
    /**
     * Remote Port where the request should be directed. Defaults to 443 for HTTPS request and 80 for HTTP request.
     */
    port?: number;
    /**
     * whatever OPTIONS request should be process locally. If set to `true`, pre-flight OPTIONS request will be handle
     * locally. An empty response will be sent and the cors headers will be defined via the HandlerConfig options.
     *
     * If set to false, the the request will be relayed to the remtoe server.
     *
     * Defaults to true.
     */
    processOptionsLocally?: boolean;
    /**
     * List of headers that should be copied over from the original request to the proxy request.
     */
    whiteListedHeaders?: string[];
    /**
     * List of headers that should be copied over from the proxy response to the lambda response.
     */
    whiteListedResponseHeaders?: string[];
}
