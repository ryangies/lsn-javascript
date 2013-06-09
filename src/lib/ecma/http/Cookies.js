/** @namespace http */
ECMAScript.Extend('http', function (ecma) {

  /**
   * @class Cookies
   * Provides methods for getting and setting cookies.
   *
   *  var cookies = new ecma.http.Cookies();
   */

  var _proto = {};

  var _xfr = new ecma.data.XFR();

  this.Cookies = function () {
  };

  this.Cookies.prototype = _proto;

  /**
   * @function encode
   * Encode an object for storage.
   *
   *  var str = cookie.encode(obj);
   *
   * @param obj <Object> Data object
   */

  _proto.encode = function (value) {
    return _xfr.format(value);
  };

  /**
   * @function decode
   * Decode an encoded string.
   *
   *  var obj = cookie.decode(str);
   *
   * @param str <String> Encoded string
   */

  _proto.decode = function (str) {
    return _xfr.parse(str);
  };

  /**
   * @function setObject
   * Set a cookie to hold the value of a data object.
   * @param name  <String> Name of the cookie
   * @param obj   <Object> Cookie data
   * @param days  <String> Number of days before it expires
   */

  _proto.setObject = function (name, value, days) {
    value = this.encode(value);
    return this.set(name, value, days);
  };

  /**
   * @function getObject
   * Get a data object stored in a cookie.
   * @param name <String> Name of the cookie
   */

  _proto.getObject = function (name) {
    var value = this.get(name);
    return value ? this.decode(value) : null;
  };

  /**
   * @function set
   * Set a cookie to the given value.
   * @param name  <String> Name of the cookie
   * @param value <String> Value of the cookie
   * @param days  <String> Number of days before it expires
   */

  _proto.set = function (name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toGMTString();
    }
    ecma.document.cookie = name + "=" + value + expires + "; path=/";
  };

  /**
   * @function get
   * Get a cookie by its name.
   * @param name <String> Name of the cookie
   */

  _proto.get = function (name) {
    var prefix = name + "=";
    var parts = ecma.document.cookie.split(';');
    for(var i=0; i < parts.length; i++) {
      var c = parts[i];
      while (c.charAt(0)==' ') c = c.substring(1, c.length);
      if (c.indexOf(prefix) == 0) return c.substring(prefix.length, c.length);
    }
    return null;
  };

  /**
   * @function remove
   * Remove a cookie.
   * @param name <String> Name of the cookie
   */

  _proto.remove = function (name) {
    this.set(name, "", -1);
  };

});
