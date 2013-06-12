/** @namespace http */
ECMAScript.Extend('http', function (ecma) {

  /**
   * @class Location
   * Provides an object structure like C<document.location> for a given URL,
   * and methods for working with the URL.
   *
   *  var location = new ecma.http.Location(); // copies document location
   *  var location = new ecma.http.Location(url);
   *
   * Sample:
   *
   *  var url = 'http://www.example.com:8000/cgi-bin/test.pl?key=value#id';
   *  var location = new ecma.http.Location(url);
   *
   *      2                          3             
   *      .-------------------------..---------------------------.
   *      |                         ||                           |
   *  1 - http://www.example.com:8000/cgi-bin/test.pl?key=value#id
   *      |  | |               | |  ||              ||        || |
   *      '--' '---------------' '--''--------------''--------''-'
   *      4    5                 6   7               8         9
   *
   *  # Accessor                    Terminology
   *  ----------------------------- ---------------------------
   *  1 location.getUri()           URI, URL L<1>
   *  2 location.getOrigin()        origin
   *  3 location.getAddress()       address L<1>
   *  4 location.protocol           protocol
   *  5 location.hostname           authority, domain, hostname
   *  6 location.port               port
   *  7 location.pathname           path, pathname
   *  8 location.search             search, query L<2>
   *  9 location.hash               hash L<3>
   *
   * As we don't know how to make object members which behive like functions,
   * there is no C<href> property.
   *
   * N<1> Note that C<location.getHref()> will return the full URI if it is not
   * of the same origin, otherwise it acts as C<location.getAddress()>.
   *
   * N<2> Use C<location.getSearch()> to return the search field without the
   * leading C<?>.
   *
   * N<3> Use C<location.getHash()> to return the hash field without the
   * leading C<#>.
   *
   * @member protocol
   * @member hostname
   * @member port
   * @member pathname
   * @member search
   * @member hash
   */

  var pseudoUri = new RegExp('^([a-z]+):[^/]'); // data:, about:, etc
  var proto = {};

  this.Location = function (uri) {
    if (uri) {
      if (uri instanceof ecma.http.Location) {
        this.copyLocation(uri);
      } else {
        this.parseUri(uri);
      }
    } else {
      this.copyDocumentLocation();
    }
  };

  this.Location.prototype = proto;

  /**
   * @function copyDocumentLocation
   */

  proto.copyDocumentLocation = function () {
    this.copyLocation(ecma.document.location);
  };

  proto.copyLocation = function (loc) {
    try {
      this.protocol = loc.protocol;
      this.hostname = loc.hostname;
      this.port = loc.port;
      this.pathname = loc.pathname;
      this.search = loc.search;
      this.hash = loc.hash;
    } catch (ex) {
      this.protocol = '';
      this.hostname = '';
      this.port = '';
      this.pathname = '';
      this.search = '';
      this.hash = '';
    }
  };

  /**
   * @function getOrigin
   */

  proto.getOrigin = function () {
    var origin = this.protocol + '//' + this.hostname;
    if (this.port) origin += ':' + this.port;
    return origin;
  };

  /**
   * @function isSameOrigin
   * Tests that the provided location originates from the same authority
   * using the same protocol and port as this location.
   *  var bool = location.isSameOrigin(uri);
   * Where:
   *  location    <ecma.http.Location>          This location
   *  uri         <ecma.http.Location|String>   Compare-to location
   */

  proto.isSameOrigin = function (loc) {
    if (!(loc instanceof ecma.http.Location)) {
      loc = new ecma.http.Location(loc);
    }
    return loc.getOrigin() == this.getOrigin();
  };

  /**
   * @function isSameDocument
   * Tests that the provided location refers to the same document as this
   * location.
   *  var bool = location.isSameDocument(uri);
   * Where:
   *  location    <ecma.http.Location>          This location
   *  uri         <ecma.http.Location|String>   Compare-to location
   */

  proto.isSameDocument = function (loc) {
    if (!(loc instanceof ecma.http.Location)) {
      loc = new ecma.http.Location(loc);
    }
    return loc.getDocumentUri() == this.getDocumentUri();
  };

  /**
   * @function getUri
   * Returns the entire URI string.
   */

  proto.getUri = function () {
    return this.getOrigin() + this.getAddress()
  };

  /**
   * @function toString
   * Calls L<ecma.http.Location.getUri>
   */

  proto.getHref = proto.getUri;

  /**
   * @function getDocumentUri
   * Return the URI of the document, i.e., niether search nor hash segements 
   * are included.
   *  var uri = location.getDocumentUri();
   */

  proto.getDocumentUri = function () {
    return this.getOrigin() + this.pathname;
  };

  /**
   * @function getHref
   * When the location is of the same origin, returns
   * L<ecma.http.Location.getAddress>, otherwise returns
   * L<ecma.http.Location.getUri>.
   */

  proto.getHref = function () {
    return new ecma.http.Location().isSameOrigin(this)
      ? this.getAddress() : this.getUri();
  };

  /**
   * @function getAddress
   * Returns the pathname, query, and hash portions of this location.
   *  var addr = location.getAddress();
   */

  proto.getAddress = function () {
    return this.pathname + this.search + this.hash;
  };

  /**
   * @function getSearch
   * Returns search portion of this location without the leading C<?>.
   *  var search = location.getSearch();
   */

  proto.getSearch = function () {
    return this.search ? this.search.replace(/^\?/,'') : '';
  };

  /**
   * @function getHash
   * Returns hash portion of this location without the leading C<#>.
   *  var hash = location.getHash();
   */

  proto.getHash = function () {
    return this.hash ? this.hash.replace(/^#/,'') : '';
  };

  /**
   * @function addParameter
   * Adds a parameter to the search portion of this location.  Remember to
   * C<encodeURIComponent> your key and value.
   *  var search = location.addParameter(key, value);
   */

  proto.addParameter = function (key, value) {
    key = encodeURIComponent(key);
    value = encodeURIComponent(value);
    var prefix = this.search ? this.search + '&' : '?';
    return this.search = prefix + key + '=' + value;
  };

  /**
   * @function getParameters
   * Returns an object of search parameters.
   *  var object = location.getParameters();
   * A valid object will always be returned, allowing one to fetch a single 
   * parameter (which may or may not exist) as:
   *  var string = location.getParameters()[key];
   */
  proto.getParameters = function () {
    var result = {};
    if (!this.search) return result;
    var str = this.search.replace(/^\?/,'');
    if (!str) return result;
    var kvpairs = str.split(/[&;]/);
    for (var i = 0; i < kvpairs.length; i++) {
      var parts = kvpairs[i].split(/=/);
      var k = decodeURIComponent(parts.shift());
      var v = decodeURIComponent(parts.join());
      if (k == "" && v == "") continue;
      result[k] = result[k] != undefined
        ? result[k] instanceof Array
          ? result[k].concat(v)
          : [result[k], v]
        : v;
    }
    return result;
  };

  /**
   * @function parseUri
   * Sets this object's member values accoding to the provided URI.
   *
   *  location.parseUri(newUri);
   *
   * If the `newUri` begins like 'data:gif' or 'about:blank', we only set
   * the protocol member. This will result in a valid location object, however
   * it won't be too useful. To make this a functional scenario, each of
   * the accessor methods (like L<getHref>) need to be thought through.
   */

  proto.parseUri = function (uri) {
    this.copyDocumentLocation();
    this.search = '';
    this.hash = '';
    var href = undefined;
    var pseudoMatch = pseudoUri.test(uri);
    if (pseudoMatch) {
      this.protocol = pseudoMatch[0];
      this.hostname = '';
      this.port = '';
      this.pathname = '';
    } else if (uri.indexOf('//') == 0) {
      href = this.protocol + uri;
    } else if ((uri.indexOf('?') == 0) || (uri.indexOf('#') == 0)) {
      href = this.getOrigin() + this.pathname + uri;
    } else if (uri.indexOf('/') == 0) {
      href = this.getOrigin() + uri;
    } else if (uri.indexOf('://') == -1) {
      var base = this.pathname.match(/\/$/)
        ? this.pathname
        : ecma.data.addr_parent(this.pathname) + '/';
      href = this.getOrigin() + base + uri;
    } else {
      href = uri;
    }
    var m = href.match(/^([^\/]+:)?\/\/([^\/#?:]*):?([0-9]*)([^#?]*)(\??[^#]*)(#?.*)/);
    if (!m) throw new Error('cannot parse uri');
    this.protocol = m[1] ? m[1].toLowerCase() : ecma.document.location.protocol;
    this.hostname = m[2].toLowerCase();
    this.port = m[3] || '';
    this.pathname = m[4] || '';
    this.search = m[5] || '';
    this.hash = m[6] || '';
  };

});
