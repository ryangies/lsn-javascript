/** @namespace http */
ECMAScript.Extend('http', function (ecma) {

  var _package = this;
  var _base = ecma.http.Request;
  var _proto = ecma.lang.createPrototype(_base);
  var _super = _base.prototype;

  /**
   * @class JSONRequest
   *
   *  @param uri <String>
   *  @param userOptions <Object>
   *
   * Extends C<ecma.http.Request> setting appropriate request headers and
   * response parser.
   */

  _package.JSONRequest = function (uri, userOptions) {
    var options = ecma.util.overlay({
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Accept-Content-Encoding': 'json',
        'X-Content-Format': 'application/json',
        'X-Content-Encoding': 'json',
        'Content-Type': 'application/json'
      }
    }, userOptions);
    _base.apply(this, [uri, options]);
  };

  _package.JSONRequest.prototype = _proto;

  _proto.parseBody = function (body) {
    return ecma.util.isObject(body) ? ecma.data.json.format(body) : body;
  };

  _proto.parseResponse = function () {
    try {
      this.responseJSON = ecma.data.json.parse(this.xhr.responseText);
    } catch (ex) {
      js.error.reportError(ex);
    }
  };

});
