/** @namespace lsn.auth */
ECMAScript.Extend('lsn.auth', function (ecma) {

  var _basic_auth_token = null;

  /**
   * @function setAuthToken
   */

  this.setAuthToken = function (tk) {
    _basic_auth_token = tk;
  };

  /**
   * @function getAuthToken
   */

  this.getAuthToken = function () {
    if (_basic_auth_token === null) {
      var nodeList = ecma.document.head.getElementsByTagName('META');
      for (var i = 0, node; node = nodeList[i]; i++) {
        if (ecma.dom.getAttribute(node, 'name') == 'auth-token') {
          _basic_auth_token = ecma.dom.getAttribute(node, 'content');
          break;
        }
      }
    }
    return _basic_auth_token ? _basic_auth_token : '';
  };

  /**
   * @function basic
   */

  this.basic = function (un, pw) {
    var h1 = ecma.crypt.hex_sha1(pw);
    var h2 = ecma.crypt.hex_sha1(h1 + ':' + _basic_auth_token);
    return {'un': un, 'h2': h2};
  };

});
