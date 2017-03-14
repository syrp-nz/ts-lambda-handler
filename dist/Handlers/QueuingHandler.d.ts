import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
import { AmazonResourceName, SQSQueueARN } from '../Utilities';
import { HandlerConfig } from '../Config';
/**
 * Get an event store to a queue with a schedule function to run it.
 */
export declare class QueuingHandler extends AbstractHandler {
    protected lambdaFn: string;
    protected arn: SQSQueueARN;
    /**
     * Intanciate the QueuingHandler
     * @param  {AmazonResourceName|string} arn ARN of the queue where the event should be saved
     * @param  {string}                    lambdaFn Lambda function that will be used to process the message. This will
     *                                              be stored as an attribute on the message. If left blank, no
     *                                              attribute will be stored and the processing method will need to be
     *                                              define manually.
     * @param  {HandlerConfig}              config
     */
    constructor(arn: AmazonResourceName | string, lambdaFn?: string, config?: HandlerConfig);
    process(request: Request, response: Response): Promise<void>;
    /**
     * You can override this method if the event needs validated in some way before being stored in a queue. If the
     * event is invalid, this method should return a rejected promise with an suitable HttpError.
     *
     * If the method is not overriden, the event will systematically be stored in the queue.
     *
     * @return {Promise<void>} [description]
     */
    protected validateRequest(request: Request): Promise<void>;
    /**
     * Sends an empty 200 OK response. If your handler needs to return something different, you can override this
     * method.
     * @param  {Response}      response
     * @return {Promise<void>}
     */
    protected sendResponse(response: Response): Promise<void>;
}
