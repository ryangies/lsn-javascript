/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @class Container
   * Base class for L<ecma.data.Array> and L<ecma.data.HashList>.
   */

  this.Container = function () {
  };

  /**
   * @function clear
   * Clear contents
   */

  this.Container.prototype.clear = ecma.lang.createAbstractFunction();

  /**
   * @function get
   * Get a value by its address.
   *  var value = container.get('alpha');
   *  var value = container.get('alpha/bravo');
   *  var value = container.get('alpha/bravo/0');
   */
  this.Container.prototype.get = function (addr) {
    if (!ecma.util.defined(addr) || addr === '') return;
    var parts = ecma.data.addr_split(addr);
    var c = this;
    for (var i = 0; i < parts.length; i++) {
      if (typeof(c) == 'undefined' || !c.getValue) return;
      c = c.getValue(parts[i]);
    }
    return c;
  };

  /**
   * @function set
   * Set a value at the given address.
   *  container.setValue('alpha', {});
   *  container.setValue('alpha/bravo', []);
   *  container.setValue('alpha/bravo/0', 'charlie');
   */
  this.Container.prototype.set = function (addr, value) {
    var parts = ecma.data.addr_split(addr);
    var lastKey = parts.pop();
    if (ecma.util.defined(lastKey)) {
      var ptr = this;
      for (var i = 0; i < parts.length; i++) {
        var key = parts[i];
        var node = ptr.getValue(key);
        if (!ecma.util.defined(node)) {
          node = ptr.setValue(key, new ecma.data.HashList());
        }
        ptr = node;
      }
      return ptr.setValue(lastKey, value);
    } else if (ecma.util.isa(value, ecma.data.Container)) {
      this.clear();
      value.iterate(function (k, v) {
        this.set(k, v);
      }, this);
    }
  };

  /**
   * @function remove
   * Remove a value by its address.
   *  container.remove('/alpha/bravo');
   */
  this.Container.prototype.remove = function (addr) {
    var parts = ecma.data.addr_split(addr);
    var lastKey = parts.pop();
    if (!ecma.util.defined(lastKey)) return;
    var parent = this.get(parts);
    if (ecma.util.isa(parent, ecma.data.Container)) parent.removeValue(lastKey);
  };

  /**
   * @function walk
   * Recursively iterate the container applying a callback with each item.
   *
   *  container.walk(function);
   *  container.walk(function, scope);
   *
   * The callback function is passed four parameters
   *
   *  key     The current key
   *  value   The current value
   *  depth   Integer index indicating how deep we have recursed
   *  addr    The address of the current value
   *  pv      The pv of the current value
   *
   *  container.walk(function (key, value, depth, addr, pv) {
   *  });
   */
  this.Container.prototype.walk = function (callback, scope, prefix, depth) {
    if (!depth) depth = 0;
    this.iterate(function (k,v) {
      var addr = ecma.util.defined(prefix) ? prefix + '/' + k : k;
      callback.apply(scope, [k, v, depth, addr, this]);
      if (ecma.util.isa(v, ecma.data.Container)) {
        v.walk(callback, scope, addr, (depth + 1));
      }
    }, this);
  };

  /**
   * @function toObject
   * Create a (normal) JavaScript Object from this container.
   *
   *  var Array = container.toObject();   // when it is an ecma.data.Array
   *  var Object = container.toObject();  // when it is an ecma.data.HashList
   */
  this.Container.prototype.toObject = function () {
    var result = ecma.util.isa(this, ecma.data.Array) ? [] : {};
    this.iterate(function (k, v) {
      result[k] = typeof(v.toObject) == 'function' ? v.toObject() : v;
    }, this);
    return result;
  };

  /**
   * @function toXFR
   * Create a transfer-encoded string which represents the data.
   *  var string = container.toXFR();
   */
  this.Container.prototype.toXFR = function () {
    var result = '';
    this.iterate(function (k, v) {
      result += ecma.data.xfr.encodeComponent(k);
      result += v.toXFR ? v.toXFR() : '${' + ecma.data.xfr.encodeComponent(v) + '}';
    }, this);
    return result;
  };

  /**
   * @function getObject
   * Return the object representation of this or the specified child.
   *  var object = container.getObject();
   *  var object = container.getObject('/alpha/bravo');
   */

  this.Container.prototype.getObject = function (addr) {
    if (!ecma.util.defined(addr)) return this.toObject();
    var v = this.get(addr);
    return ecma.util.defined(v) ? v.toObject() : v;
  };


  /**
   * @function getString
   * Return the string representation of this or the specified child.
   *  var string = container.getString();
   *  var string = container.getString('/alpha/bravo');
   */

  this.Container.prototype.getString = function (addr) {
    if (!ecma.util.defined(addr)) return this.toString();
    var v = this.get(addr);
    return ecma.util.defined(v) ? v.toString() : v;
  };

});
