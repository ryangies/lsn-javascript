/**
 * @namespace http
 *
 * The C<http> namespace groups functions and classes used while making
 * HTTP Requests.
 *
 */

ECMAScript.Extend('http', function (ecma) {

  // Intentionally private
  var _documentLocation = null

  function _getDocumentLocation () {
    if (!_documentLocation) _documentLocation = new ecma.http.Location();
    return _documentLocation;
  }

  /**
   * @constant HTTP_STATUS_NAMES
   * HTTP/1.1 Status Code Definitions
   *
   * Taken from, RFC 2616 Section 10:
   * L<http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html>
   *
   * These names are used in conjuction with L<ecma.http.Request> for 
   * indicating callback functions.  The name is prepended with C<on> such 
   * that
   *  onMethodNotAllowed
   * corresponds to the callback triggered when a 405 status is received.
   *
   # Names
   *
   *  100   Continue
   *  101   SwitchingProtocols
   *  200   Ok
   *  201   Created
   *  202   Accepted
   *  203   NonAuthoritativeInformation
   *  204   NoContent
   *  205   ResetContent
   *  206   PartialContent
   *  300   MultipleChoices
   *  301   MovedPermanently
   *  302   Found
   *  303   SeeOther
   *  304   NotModified
   *  305   UseProxy
   *  306   Unused
   *  307   TemporaryRedirect
   *  400   BadRequest
   *  401   Unauthorized
   *  402   PaymentRequired
   *  403   Forbidden
   *  404   NotFound
   *  405   MethodNotAllowed
   *  406   NotAcceptable
   *  407   ProxyAuthenticationRequired
   *  408   RequestTimeout
   *  409   Conflict
   *  410   Gone
   *  411   LengthRequired
   *  412   PreconditionFailed
   *  413   RequestEntityTooLarge
   *  414   RequestURITooLong
   *  415   UnsupportedMediaType
   *  416   RequestedRangeNotSatisfiable
   *  417   ExpectationFailed
   *  500   InternalServerError
   *  501   NotImplemented
   *  502   BadGateway
   *  503   ServiceUnavailable
   *  504   GatewayTimeout
   *  505   HTTPVersionNotSupported
   */

  this.HTTP_STATUS_NAMES = {
    100: 'Continue',
    101: 'SwitchingProtocols',
    200: 'Ok',
    201: 'Created',
    202: 'Accepted',
    203: 'NonAuthoritativeInformation',
    204: 'NoContent',
    205: 'ResetContent',
    206: 'PartialContent',
    300: 'MultipleChoices',
    301: 'MovedPermanently',
    302: 'Found',
    303: 'SeeOther',
    304: 'NotModified',
    305: 'UseProxy',
    306: 'Unused',
    307: 'TemporaryRedirect',
    400: 'BadRequest',
    401: 'Unauthorized',
    402: 'PaymentRequired',
    403: 'Forbidden',
    404: 'NotFound',
    405: 'MethodNotAllowed',
    406: 'NotAcceptable',
    407: 'ProxyAuthenticationRequired',
    408: 'RequestTimeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'LengthRequired',
    412: 'PreconditionFailed',
    413: 'RequestEntityTooLarge',
    414: 'RequestURITooLong',
    415: 'UnsupportedMediaType',
    416: 'RequestedRangeNotSatisfiable',
    417: 'ExpectationFailed',
    500: 'InternalServerError',
    501: 'NotImplemented',
    502: 'BadGateway',
    503: 'ServiceUnavailable',
    504: 'GatewayTimeout',
    505: 'HTTPVersionNotSupported'
  };

  /**
   * @function isSameOrigin
   *
   * Compare originating servers.
   *
   *  var bool = ecma.http.isSameOrigin(uri);
   *  var bool = ecma.http.isSameOrigin(uri, uri);
   *
   * Is the resource located on the server at the port using the same protocol
   * which served the document.
   *
   *  var bool = ecma.http.isSameOrigin('http://www.example.com');
   *
   * Are the two URI's served from the same origin
   *
   *  var bool = ecma.http.isSameOrigin('http://www.example.com', 'https://www.example.com');
   *
   */

  this.isSameOrigin = function(uri1, uri2) {
    if (!(uri1)) return false;
    var loc1 = uri1 instanceof ecma.http.Location
      ? uri1 : new ecma.http.Location(uri1);
    var loc2 = uri2 || _getDocumentLocation();
    return loc1.isSameOrigin(loc2);
  };

});
