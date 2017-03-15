import { HandlerConfig } from './HandlerConfig';
/**
 * Configuration settings for the ProcessQueueHandler
 */
export interface ProcessQueueHandlerConfig extends HandlerConfig {
    /**
     * Prefix that should be applied to lambdaFn to determine the function name that will be used to process the
     * messages.
     */
    lambdaFnPrefix?: string;
    /**
     * Lambda function that will be used to process the messages. If left blank, the handler will attempt to read the
     * lambdaFn attribute off the message.
     */
    lambdaFn?: string;
    /**
     * Number of message that should be read from the Queue.
     */
    messageNumber?: number;
    /**
     * Number of seconds a messages should be invisible after being read.
     */
    visibilityTimeout?: number;
}
