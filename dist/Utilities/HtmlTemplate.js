"use strict";
var fs = require("fs-promise");
var buffer_1 = require("buffer");
var Mustache = require("mustache");
/**
 * Use Mustache JS to render html.
 */
var HtmlTemplate = (function () {
    function HtmlTemplate() {
        var _this = this;
        /**
         * Main template string
         * @type {string}
         */
        this.base = '';
        /**
         * Partials that will be loaded in the base template.
         */
        this.partials = {};
        /**
         * Store file read request in here. When rendering the template, we make sure all those promises have resolve.
         */
        this.promises = [];
        /**
         * Data that will be use to populate the template
         */
        this.data = {};
        /**
         * Load the main tempalte from a file.
         * @param {string}  filename
         * @return {this}
         */
        this.setTemplate = function (filename) {
            var p = fs.readFile(filename).then(function (template) {
                _this.setTemplateString(template);
                return Promise.resolve(true);
            });
            _this.promises.push(p);
            return _this;
        };
        /**
         * Load a partial from a file.
         * @param {string}  key
         * @param {string}  filename
         * @return {this}
         */
        this.setPartial = function (key, filename) {
            var p = fs.readFile(filename).then(function (template) {
                _this.setPartialString(key, template);
                return Promise.resolve(true);
            });
            _this.promises.push(p);
            return _this;
        };
        /**
         * Render the template and promise a string.
         * @param {[key:string]:any} data   Optional data to inject into the template.
         * @return {Promise<string>}
         */
        this.render = function (data) {
            if (data === void 0) { data = {}; }
            Object.assign(_this.data, data);
            // We need to make sure all our file reads are done before rendering the template
            return Promise
                .all(_this.promises)
                .then(function () { return Promise.resolve(_this.renderNow()); });
        };
    }
    /**
     * Set the template as a string.
     * @param  {string|Buffer} template
     * @return {this}
     */
    HtmlTemplate.prototype.setTemplateString = function (template) {
        this.base = this.stringOrBuffer(template);
        return this;
    };
    /**
     * Set a partial using a string.
     * @param  {string}        key
     * @param  {string|Buffer} template
     * @return {this}
     */
    HtmlTemplate.prototype.setPartialString = function (key, template) {
        this.partials[key] = this.stringOrBuffer(template);
        return this;
    };
    /**
     * Utility function that receives a string or a buffer object convert its input in to string.
     * @param  {string|Buffer} template
     * @return {string}
     */
    HtmlTemplate.prototype.stringOrBuffer = function (template) {
        if (template instanceof buffer_1.Buffer) {
            return template.toString('utf-8');
        }
        else {
            return template;
        }
    };
    /**
     * Inject some data into the template
     * @param  {string} key
     * @param  {any}    value
     * @return {this}
     */
    HtmlTemplate.prototype.inject = function (key, value) {
        this.data[key] = value;
        return this;
    };
    /**
     * Render the template now. You need to make sure all the file reads have completed before calling this method.
     * @return {string}
     */
    HtmlTemplate.prototype.renderNow = function () {
        return Mustache.render(this.base, this.data, this.partials);
    };
    return HtmlTemplate;
}());
exports.HtmlTemplate = HtmlTemplate;
//# sourceMappingURL=/var/www/LambdaHandler/src/Utilities/HtmlTemplate.js.map