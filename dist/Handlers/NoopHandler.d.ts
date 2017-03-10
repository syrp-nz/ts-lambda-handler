import { AbstractHandler } from './AbstractHandler';
import { Request } from '../Request';
import { Response } from '../Response';
/**
 * An Handler that will systematically return nothing with a 200 status code. Can be usefull for testing, for replying to OPTION request or as a palceholder handler.
 */
export declare class NoopHandler extends AbstractHandler {
    process(request: Request, response: Response): Promise<void>;
}
