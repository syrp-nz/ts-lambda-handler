import * as fs from 'fs-extra';
import { Buffer } from 'buffer';
import * as Mustache from 'mustache';

/**
 * Use Mustache JS to render html.
 */
export class HtmlTemplate {

    /**
     * Main template string
     * @type {string}
     */
    protected base:string = '';

    /**
     * Partials that will be loaded in the base template.
     */
    protected partials: {[key:string]: string} = {};

    /**
     * Store file read request in here. When rendering the template, we make sure all those promises have resolve.
     */
    protected promises: Promise<any>[] = [];

    /**
     * Data that will be use to populate the template
     */
    protected data:{[key:string]: any} = {};



    /**
     * Set the template as a string.
     * @param  {string|Buffer} template
     * @return {this}
     */
    public setTemplateString(template:string|Buffer): this {
        this.base = this.stringOrBuffer(template);
        return this;
    }

    /**
     * Set a partial using a string.
     * @param  {string}        key
     * @param  {string|Buffer} template
     * @return {this}
     */
    public setPartialString(key:string, template:string|Buffer): this {
        this.partials[key] = this.stringOrBuffer(template);
        return this;
    }

    /**
     * Utility function that receives a string or a buffer object convert its input in to string.
     * @param  {string|Buffer} template
     * @return {string}
     */
    protected stringOrBuffer(template:string|Buffer): string {
        if (template instanceof Buffer) {
            return template.toString('utf-8');
        } else {
            return template;
        }
    }

    /**
     * Load the main tempalte from a file.
     * @param {string}  filename
     * @return {this}
     */
    public setTemplate = (filename: string): this => {
        const p = fs.readFile(filename).then((template) => {
            this.setTemplateString(template);
            return Promise.resolve(true);
        });
        this.promises.push(p);

        return this;
    }

    /**
     * Load a partial from a file.
     * @param {string}  key
     * @param {string}  filename
     * @return {this}
     */
    public setPartial = (key:string, filename: string): this => {
        const p = fs.readFile(filename).then((template) => {
            this.setPartialString(key, template);
            return Promise.resolve(true);
        });
        this.promises.push(p);

        return this;
    }

    /**
     * Inject some data into the template
     * @param  {string} key
     * @param  {any}    value
     * @return {this}
     */
    public inject(key:string, value:any): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Render the template and promise a string.
     * @param {[key:string]:any} data   Optional data to inject into the template.
     * @return {Promise<string>}
     */
    public render = (data: {[key:string]: any} = {}): Promise<string> => {
        Object.assign(this.data, data);

        // We need to make sure all our file reads are done before rendering the template
        return Promise
            .all(this.promises)
            .then(() => Promise.resolve(this.renderNow()));
    }

    /**
     * Render the template now. You need to make sure all the file reads have completed before calling this method.
     * @return {string}
     */
    protected renderNow(): string {
        return Mustache.render(this.base, this.data, this.partials);
    }

}
