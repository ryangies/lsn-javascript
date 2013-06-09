/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CArray = ecma.data.Array;
  var CNode = ecma.hubb.Node;

  /**
   * @class ArrayNode
   */

  this.ArrayNode = function () {
    CArray.apply(this, arguments);
    CNode.apply(this, arguments);
  };

  var proto = ecma.lang.createPrototype(CArray, CNode);

  this.ArrayNode.prototype = proto;

  /**
   * @function setAddress
   */

  proto.setAddress = function (addr) {
    CNode.prototype.setAddress.call(this, addr);
    this.iterate(function (key, value) {
      value.setParentAddress(addr);
    });
  };

  /**
   * @function renameValue
   */

  proto.renameValue = function (oldKey, newKey, index) {
    throw new Error('Array nodes cannot be renamed');
  };

  /**
   * @function setValue
   */

  proto.setValue = function (key, value) {
    var result = CArray.prototype.setValue.call(this, key, value);
    if (ecma.util.isa(value, ecma.hubb.Node)) {
      value.setParentNode(this);
    }
    return result;
  };

  /**
   * @function sortByKey
   */

  proto.sortByKey = function (keys) {
    if (keys.length !== this.length) throw new Error('Length mis-match');
    var hasChanged = false;
    var data = [];
    for (var i in keys) {
      var key = keys[i];
      var item = this.getValue(key);
      if (item.getKey() != i) {
        item.setKey(i);
        hasChanged = true;
      }
      data.push(item);
    }
    if (hasChanged) {
      this.data = data;
      this.executeAction({'name': 'update', 'updated': {'order': true}}, this);
    }
  };

  /**
   * @function removeValue
   */

  proto.removeValue = function (key) {
    var result = CArray.prototype.removeValue.call(this, key);
    if (result) {
      for (var i = key; i < this.data.length; i++) {
        var item = this.data[i];
        item.setKey(i);
      }
      result.executeAction('remove', result);
//    this.executeAction('remove', result); // Backward compatible
      return result;
    }
  };

  /**
   * @function merge
   */

  proto.merge = function (value) {
    while (this.length > value.length) {
      this.removeValue(this.length - 1);
    }
    value.iterate(function (k, v) {
      var myValue = this.getValue(k);
      try {
        myValue.merge(v);
      } catch (ex) {
        this.setValue(k, v);
        var action = myValue ? 'replace' : 'create';
        this.executeAction(action, v, 'key=' + k);
      }
    }, this);
    return CNode.prototype.merge.apply(this, arguments);
  };

});
