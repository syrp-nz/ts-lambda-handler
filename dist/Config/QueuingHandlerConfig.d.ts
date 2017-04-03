import { HandlerConfig } from './HandlerConfig';
import { AmazonResourceName } from '../Utilities';
/**
 * Configuration settings for the ProcessQueueHandler
 */
export interface QueuingHandlerConfig extends HandlerConfig {
    /**
     * Lambda function that will be used to process the messages. If left blank, the processing handler will need to
     * define its own function.
     */
    lambdaFn?: string;
    /**
     * A ARN for an SNS topic. If this is specified, a message will be published to this topic once the event aws been queued. This can be used to trigger another function that will process the message.
     */
    notifySNSTopic?: AmazonResourceName | string;
}
