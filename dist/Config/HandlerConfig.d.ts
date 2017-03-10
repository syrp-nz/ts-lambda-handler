import { SchemaMap } from 'joi';
import { CorsPolicyRule } from './CorsPolicyRule';
import { HandlerAuthorizer } from '../Authorizers';
/**
 * Configuration settings for a Handler object.
 */
export interface HandlerConfig {
    /**
     * Define default configuration for our CORS plicy.
     */
    cors?: CorsPolicyRule;
    /**
     * JOI validation Rules that will be use to validate the request.
     */
    requestSchema?: SchemaMap;
    /**
     * Determines if the current user can access the request. If not define, assume there's no restriction on the request.
     */
    authorizer?: HandlerAuthorizer;
    /**
     * List of environement variables that should be decrypted.
     */
    encryptedEnvironmentVariables?: {
        cipherVarName: string;
        decryptedVarName?: string;
        encoding?: string;
    }[];
}
