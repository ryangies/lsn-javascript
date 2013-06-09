/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @class Pool
   *  var object = new ecma.data.Pool();
   */

  this.Pool = function CPool () {
    this.clear();
  };

  var _proto = this.Pool.prototype = ecma.lang.Methods();

  /**
   * @function clear - Remove all items from the pool
   *
   *  pool.clear();
   *
   */

  _proto.clear = function () {
    this.poolItems = [];
  };

  /**
   * @function get - Get an item from the pool
   *
   */

  _proto.get = function (cb) {
    if (!ecma.util.isCallback(cb)) {
      throw new TypeError('Callback function expected.');
    }
    for (var i = 0; i < this.poolItems.length; i++) {
      var item = this.poolItems[i];
      if (ecma.lang.callback(cb, null, [item])) {
        return item;
      }
    }
  };

  _proto.getIndex = function (cb) {
    for (var i = 0; i < this.poolItems.length; i++) {
      var item = this.poolItems[i];
      if (ecma.lang.callback(cb, null, [item])) {
        return i;
      }
    }
  };

  _proto.getAt = function (i) {
    return this.poolItems[i];
  };

  _proto.getAll = function () {
    return this.poolItems;
  };

  _proto.add = function (item) {
    return this.poolItems.push(item);
  };

  _proto.remove = function (item) {
    var i = this.getIndex(function (unk) {
      return unk === item;
    });
    if (ecma.util.defined(i)) {
      return this.poolItems.splice(i, 1);
    }
  };

  _proto.forEach = function (cb, scope) {
    var length = this.poolItems.length >>> 0;
    for (var i = 0; i < length; i++) {
      var item = this.poolItems[i];
      ecma.lang.callback(cb, scope, [item, i, this.poolItems]);
    }
  };

});
