/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @class Array
   * Wrapper class for JavaScript Arrays which extends L<ecma.data.Container>.
   *  var object = new ecma.data.Array();
   *  var object = new ecma.data.Array('alpha', 'bravo');
   * TODO Create methods: C<shift, unshift>
   */
  this.Array = function () {
    this.clear();
    var args = ecma.util.args(arguments);
    if (args) {
      this.data = args;
      this.length = this.data.length;
    }
  };

  this.Array.prototype = ecma.lang.Methods(ecma.data.Container);

  /**
   * @function clear
   * Remove all items.
   */
  this.Array.prototype.clear = function () {
    this.data = [];
    this.length = 0;
  };

  /**
   * @function getValue
   * Get a value by its index.
   *  var unknown = array.getValue(0);
   */
  this.Array.prototype.getValue = function (key) {
    return this.data[key];
  };

  /**
   * @function setValue
   * Set a value by its index.
   *  array.setValue(0, 'alpha');
   */
  this.Array.prototype.setValue = function (key, value) {
    if (typeof(key) != 'number') key = ecma.util.asInt(key);
    var result = this.data[key] = value;
    this.length = this.data.length;
    return result;
  };

  this.Array.prototype.indexOfKey = function (key) {
    return js.util.asInt(key);
  };

  this.Array.prototype.indexOfValue = function (value) {
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i] === value) return i;
    }
    return null;
  };

  /**
   * @function push
   * Push a value on to the end of the array.
   *  array.push('bravo');
   * Returns the value pushed on to the array.
   */
  this.Array.prototype.push = function (value) {
    return this.setValue(this.data.length, value);
  };

  /**
   * @function removeValue
   * Remove a value from the array by its index.
   *  array.removeValue(0);
   * Returns the value removed from the array.
   */
  this.Array.prototype.removeValue = function (key) {
    if (typeof(key) != 'number') key = ecma.util.asInt(key);
    var result = this.data.splice(key, 1);
    this.length = this.data.length;
    return result[0]; // we know we only spliced 1 element
  };

  /**
   * @function keys
   * Get an array of this array's indexes.
   *  var array = array.keys();
   */
  this.Array.prototype.keys = function () {
    var result = [];
    for (var i = 0; i < this.data.length; i++) {
      result.push(i);
    }
    return result;
  };

  /**
   * @function values
   * Get an array of this array's values.
   *  var array = array.values();
   */
  this.Array.prototype.values = function () {
    return [].concat(this.data); // copy
  };

  /**
   * @function iterate
   * Iterate the array, applying a callback function with each item.
   *  array.iterate(function (index, value) { ... });
   *  array.iterate(function (index, value) { ... }, scope);
   */
  this.Array.prototype.iterate = function (cb, scope) {
    for (var i = 0; i < this.data.length; i++) {
      ecma.lang.callback(cb, scope, [i, this.data[i]]);
    }
  };

  /**
   * @function toXFR
   * Create a transfer-encoded string representing this array.
   *  var string = array.toXFR();
   */
  this.Array.prototype.toXFR = function () {
    var result = '';
    this.iterate(function (k, v) {
      result += v.toXFR ? v.toXFR() : '${' + ecma.data.xfr.encodeComponent(v) + '}';
    }, this);
    return '@{' + result + '}';
  };

});
