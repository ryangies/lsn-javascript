/** @namespace http */
ECMAScript.Extend('http', function (ecma) {

  var CRequest = ecma.lsn.Request;
  var CAction = ecma.action.ActionDispatcher;

  /**
   * @class Stream
   * @base lsn.Request
   */

  this.Stream = function () {
    CAction.apply(this);
    CRequest.apply(this, arguments);
    this.responseParts = [];
    this.boundary = null; // content boundary
    this.pos = 0; // index into responseText
  };

  var _proto = this.Stream.prototype = ecma.lang.createPrototype(CAction, CRequest);

  _proto.parseResponseHeaders = function () {
    this.xContentFormat = this.xhr.getResponseHeader('X-Content-Format');
    this.xContentEncoding = this.xhr.getResponseHeader('X-Content-Encoding');
    var contentType = this.xhr.getResponseHeader('Content-Type');
    var match = contentType.match(/boundary=([^\s]+)/);
    this.boundary = match ? match[1] : undefined;
  };

  _proto.getXFR = function () {
    if (this.xfr) return this.xfr;
    if (this.xContentFormat && this.xContentFormat == 'text/data-xfr') {
      return this.xfr = new ecma.data.XFR(this.xContentEncoding);
    } else {
      throw new Error('Response content is not in XFR format');
    }
  };

  _proto.onInteractive = function () {
    this.parseResponse();
  };

  _proto.submit = function () {
    this.responseParts = [];
    this.boundary = null;
    this.pos = 0;
    CRequest.prototype.submit.apply(this, arguments);
  };

  _proto.resubmit = function () {
    this.responseParts = [];
    this.boundary = null;
    this.pos = 0;
    CRequest.prototype.resubmit.apply(this, arguments);
  };

  /**
   * The last part is either an empty segment because the text ends with 
   * the boundary, or it is an incomplete segment.
   */

  _proto.parseResponse = function () {
    try {
      if (!this.xhr.responseText) return;
    } catch (ex) {
      // Not available
      return;
    }
    if (this.pos == 0) this.parseResponseHeaders();
    if ((this.xhr.responseText.length) > this.pos) {
      var parts = this.boundary
        ? this.xhr.responseText.split(this.boundary)
        : [this.responseText, undefined];
      parts.pop();
      for (var i = this.responseParts.length, part; part = parts[i]; i++) {
        this.responseParts[i] = this.getXFR().parse(part);
        this.executeClassAction('onReceive', this.responseParts[i], i);
      }
      this.pos = this.xhr.responseText.length;
    }
  };

});
