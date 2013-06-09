/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var _pendingAuth = [];
  var _loginDialog = null;
  var CRequest = ecma.http.Request;
  var _proto = ecma.lang.createPrototype(CRequest);

  function _resubmitPending () {
    var req = _pendingAuth.shift();
    while (req) {
      req.resubmit();
      req = _pendingAuth.shift();
    }
  }

  function _flushPending () {
    var req = _pendingAuth.shift();
    while (req) {
      req.completeRequest();
      req = _pendingAuth.shift();
    }
  }

  /**
   * @class Request
   * @base ecma.http.Request
   */

  this.Request = function CLivesiteRequest (uri, userOptions) {
    var options = ecma.util.overlay({
      method: 'POST',
      loginURI: '/res/login/login.dlg',
      headers: {
        'Accept': 'text/data-xfr',
        'X-Accept-Content-Encoding': 'base64',
        'X-Content-Format': 'text/data-xfr',
        'X-Content-Encoding': 'base64',
        'Content-Type': 'text/plain; charset=utf-8' // the base64 does javascript utf-8 encoding, ugh
      }
    }, userOptions);
    CRequest.apply(this, [uri, options]);
  };

  this.Request.prototype = _proto;

  _proto.parseBody = function (body) {
    return body ? ecma.data.xfr.format(body) : null;
  };

  _proto.parseResponse = function () {
    var format = this.xhr.getResponseHeader('X-Content-Format');
    if (format) {
      if (format == 'text/data-xfr') {
        var encoding = this.xhr.getResponseHeader('X-Content-Encoding');
        var xfr = this.getXFR(encoding);
        this.responseHash = xfr.parse(this.xhr.responseText);
      } else if (format == 'text/json') {
        this.responseJSON = ecma.data.json.parse(this.xhr.responseText);
      }
    }
  };

  _proto.getXFR = function (encoding) {
    return new ecma.data.XFR(encoding);
  };

  _proto.canComplete = function () {
    if (this.xhr.status == 401 || (this.xhr.status == 403 && ecma.dom.browser.isOpera)) {
      if (this.uri == this.loginURI) return true;
      if (!_loginDialog) _loginDialog = this.showLoginDialog();
      _pendingAuth.push(this);
      return false;
    }
    return true;
  };

  _proto.showLoginDialog = function () {
    var loginDialog = new ecma.lsn.ui.LoginDialog(this.loginURI);
    loginDialog.dlg.show({
      onSuccess: ecma.lang.createCallback(function () {
        _loginDialog = null;
        _resubmitPending();
      }, this),
      onCancel: ecma.lang.createCallback(function () {
        _loginDialog = null;
        _flushPending();
      }, this)
    });
    return loginDialog;
  };

});
