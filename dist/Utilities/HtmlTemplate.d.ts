/// <reference types="node" />
/**
 * Use Mustache JS to render html.
 */
export declare class HtmlTemplate {
    /**
     * Main template string
     * @type {string}
     */
    protected base: string;
    /**
     * Partials that will be loaded in the base template.
     */
    protected partials: {
        [key: string]: string;
    };
    /**
     * Store file read request in here. When rendering the template, we make sure all those promises have resolve.
     */
    protected promises: Promise<any>[];
    /**
     * Data that will be use to populate the template
     */
    protected data: {
        [key: string]: any;
    };
    /**
     * Set the template as a string.
     * @param  {string|Buffer} template
     * @return {this}
     */
    setTemplateString(template: string | Buffer): this;
    /**
     * Set a partial using a string.
     * @param  {string}        key
     * @param  {string|Buffer} template
     * @return {this}
     */
    setPartialString(key: string, template: string | Buffer): this;
    /**
     * Utility function that receives a string or a buffer object convert its input in to string.
     * @param  {string|Buffer} template
     * @return {string}
     */
    protected stringOrBuffer(template: string | Buffer): string;
    /**
     * Load the main tempalte from a file.
     * @param {string}  filename
     * @return {this}
     */
    setTemplate: (filename: string) => this;
    /**
     * Load a partial from a file.
     * @param {string}  key
     * @param {string}  filename
     * @return {this}
     */
    setPartial: (key: string, filename: string) => this;
    /**
     * Inject some data into the template
     * @param  {string} key
     * @param  {any}    value
     * @return {this}
     */
    inject(key: string, value: any): this;
    /**
     * Render the template and promise a string.
     * @param {[key:string]:any} data   Optional data to inject into the template.
     * @return {Promise<string>}
     */
    render: (data?: {
        [key: string]: any;
    }) => Promise<string>;
    /**
     * Render the template now. You need to make sure all the file reads have completed before calling this method.
     * @return {string}
     */
    protected renderNow(): string;
}
