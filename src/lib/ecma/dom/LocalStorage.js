/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  function _supports_html_storage () {
    try {
      return 'localStorage' in ecma.window
          && ecma.window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * @class LocalStorage
   * Provides methods for getting and setting storage.
   *
   *  var storage = new ecma.dom.LocalStorage();
   */

  var _proto = {};

  this.LocalStorage = function () {
    if (!_supports_html_storage()) {
      throw new Error('Cannot find local storage');
    }
    this.serializer = ecma.data.json; // Supports .parse and .format
  };

  this.LocalStorage.prototype = _proto;

  /**
   * @function encode
   * Encode an object for storage.
   *
   *  var str = storage.encode(obj);
   *
   * @param obj <Object> Data object
   */

  _proto.encode = function (value) {
    return this.serializer.format(value);
  };

  /**
   * @function decode
   * Decode an encoded string.
   *
   *  var obj = storage.decode(str);
   *
   * @param str <String> Encoded string
   */

  _proto.decode = function (str) {
    return this.serializer.parse(str);
  };

  /**
   * @function setObject
   * Set a storage to hold the value of a data object.
   * @param name  <String> Name of the storage
   * @param obj   <Object> Cookie data
   */

  _proto.setObject = function (name, value) {
    value = this.encode(value);
    return this.set(name, value);
  };

  /**
   * @function getObject
   * Get a data object stored in a storage.
   * @param name <String> Name of the storage
   */

  _proto.getObject = function (name) {
    var value = this.get(name);
    return value ? this.decode(value) : null;
  };

  /**
   * @function set
   * Set a storage to the given value.
   * @param name  <String> Name of the storage
   * @param value <String> Value of the storage
   */

  _proto.set = function (name, value) {
    return ecma.window.localStorage.setItem(name, value);
  };

  /**
   * @function get
   * Get a storage by its name.
   * @param name <String> Name of the storage
   */

  _proto.get = function (name) {
    return ecma.window.localStorage.getItem(name);
  };

  /**
   * @function remove
   * Remove a storage.
   * @param name <String> Name of the storage
   */

  _proto.remove = function (name) {
    return ecma.window.localStorage.removeItem(name);
  };

});
