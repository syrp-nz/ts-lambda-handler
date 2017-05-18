/**
 * Use by `Response.setCookie` to controle the cookie options.
 */
export interface CookieOptions {
    /**
     * Require an secure connection to read the cookie. Defaults to true;
     */
    secure?: boolean;
    /**
     * Only allow this cookie to be attached to HTTP request. If set to false, the cookie can be read with client with
     * Javascript. Defaults to true.
     */
    httpOnly?: boolean;
    /**
     * Control which domain the cookie can be read from. The default behavior of a browsers is to only allow a cookie
     * to be read from the domain of the request on which it was created. e.g.:
     * by default cookies created via a request to `example.com` can not be read from a page under `www.example.com`
     *
     * Setting `domain` to `.example.com` will allow the cookie to be read from `example.com` and from any subdomain of
     * `example.com`
     */
    domain?: string;
    /**
     * Path this cookie can be read from. If a path is defined, the cookie can only be read from pages under the
     * specified path. e.g.: If a path of '/about' is set, the cookie can be read from the '/about' page and the '/about/history' page, but not from '/contact-us'
     *
     * Defaults to `/` which means the cookie can be read from any page on the site.
     */
    path?: string;
    /**
     * Set an expiry date for the cookie. This should be a UTC string or a date object. If unset, the cookie will
     * expire at the end of the browser session.
     *
     * Can not be used in conjonction with `maxAge`.
     */
    expires?: string | Date;
    /**
     * Set the cookie's `expires` attribute to be a specified number of second in the future.
     *
     * Can not be used in conjonction with `expires`.
     */
    maxAge?: number;
}
