/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @class HashList
   * Object where members are kept in fifo order.
   *  var hash = new ecma.data.HashList();
   *  var hash = new ecma.data.HashList('key1', 'val1', 'key2', 'val2');
   */
  this.HashList = function () {
    this.clear();
    for (var i = 0; arguments && i < arguments.length; i += 2) {
      var k = arguments[i];
      var v = arguments[i+1];
      this.indicies.push(k);
      this.data[k] = v;
    }
    this.length = this.indicies.length;
  };

  /** @base ecma.dom.Container */
  this.HashList.prototype = ecma.lang.Methods(ecma.data.Container);

  /**
   * @method clear
   * Remove all elements from the hash.
   *  hash.clear();
   */
  this.HashList.prototype.clear = function () {
    this.indicies = [];
    this.data = {};
    this.length = 0;
  };

  /**
   * @function getValue
   * Get a value by its key.
   *  var unknown = hash.getValue('key1');
   */
  this.HashList.prototype.getValue = function (key) {
    return this.data[key];
  };

  /**
   * @function setValue
   * Set a value by its key.
   *  var unknown = hash.setValue('key1', 'val1');
   */
  this.HashList.prototype.setValue = function (key, value, index) {
    var currentIndex = this.indexOfKey(key);
    if (ecma.util.defined(index) && currentIndex != index) {
      if (index < 0 || index > this.indicies.length)
        throw new ecma.error.IllegalArg('index');
      if (currentIndex != null) {
        this.indicies.splice(currentIndex, 1);
        if (currentIndex < index) index--;
      }
      this.indicies.splice(index, 0, key);
    } else {
      if (currentIndex == null) this.indicies.push(key);
    }
    this.length = this.indicies.length;
    return this.data[key] = value;
  };

  this.HashList.prototype.indexOfKey = function (key) {
    for (var i = 0; i < this.indicies.length; i++) {
      if (this.indicies[i] == key) return i;
    }
    return null;
  };

  this.HashList.prototype.indexOfValue = function (value) {
    for (var i = 0; i < this.indicies.length; i++) {
      if (this.data[this.indicies[i]] === value) return i;
    }
    return null;
  };

  /**
   * @function removeValue
   * Remove an item from the hash by its key.
   *  var unknown = hash.removeValue('key1');
   */
  this.HashList.prototype.removeValue = function (key) {
    for (var i = 0; i < this.indicies.length; i++) {
      if (this.indicies[i] == key) {
        this.indicies.splice(i, 1);
        break;
      }
    }
    this.length = this.indicies.length;
    var result = this.data[key];
    delete this.data[key];
    return result;
  };

  /**
   * @function keys
   * Get the array of the keys keys used in this hash.
   *  var array = hash.keys();
   */
  this.HashList.prototype.keys = function () {
    return [].concat(this.indicies);
  };

  /**
   * @function values
   * Get an array of this hash's values.
   *  var array = hash.values();
   */
  this.HashList.prototype.values = function () {
    var result = [];
    for (var i = 0; i < this.indicies.length; i++) {
      result.push(this.data[this.indicies[i]])
    }
    return result;
  };

  /**
   * @function iterate
   * Iterate the hash, applying a callback function with each item.
   *  hash.iterate(function (key, value) { ... });
   *  hash.iterate(function (key, value) { ... }, scope);
   */
  this.HashList.prototype.iterate = function (cb, scope) {
    for (var i = 0; i < this.indicies.length; i++) {
      var key = this.indicies[i];
      ecma.lang.callback(cb, scope, [key, this.data[key]]);
    }
  };

  /**
   * @function toXFR
   * Create a transfer-encoded string representing this hash.
   *  var string = hash.toXFR();
   */
  this.HashList.prototype.toXFR = function () {
    return '%{' + ecma.data.Container.prototype.toXFR.apply(this, arguments) + '}';
  };

  /**
   * @namespace data
   * @class OrderedHash
   * Depricated (use L<ecma.data.HashList>)
   */
  this.OrderedHash = this.HashList;

});

