/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CHashList = ecma.data.HashList;
  var CNode = ecma.hubb.Node;

  /**
   * @class HashNode
   */

  this.HashNode = function () {
    CHashList.apply(this, arguments);
    CNode.apply(this, arguments);
  };

  var proto = ecma.lang.createPrototype(CHashList, CNode);

  this.HashNode.prototype = proto;

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
    var value = CHashList.prototype.removeValue.call(this, oldKey);
    var result = CHashList.prototype.setValue.call(this, newKey, value, index);
    return result;
  };

  /**
   * @function setValue
   */

  proto.setValue = function (key, value, index) {
    var result = CHashList.prototype.setValue.call(this, key, value, index);
    if (ecma.util.isa(value, ecma.hubb.Node)) {
      value.setParentNode(this);
      var myAddress = this.getAddress();
      var valueAddress = value.getAddress();
      if (myAddress && !valueAddress) {
        value.setAddress(js.data.addr_join(myAddress, key));
      }
    }
    return result;
  };

  /**
   * @function sortByKey
   */

  proto.sortByKey = function (keys) {
    if (keys.length !== this.indicies.length) throw new Error('Length mis-match');
    var myKeys = this.keys();
    var indicies = [];
    var hasChanged = false;
    for (var i in keys) {
      var key = keys[i];
      indicies.push(key);
      if (myKeys[i] != keys[i]) hasChanged = true;
    }
    if (hasChanged) {
      this.indicies = indicies;
      this.executeAction({'name': 'update', 'updated': {'order': true}}, this);
    }
  };

  /**
   * @function removeValue
   */

  proto.removeValue = function (key) {
    var result = CHashList.prototype.removeValue.call(this, key);
    if (result) {
      result.executeAction('remove', result);
//    this.executeAction('remove', result); // Backward compatible
      return result;
    }
  };

  /**
   * @function crop
   */

  proto.crop = function (keys) {
    var myKeys = this.keys();
    var count = 0;
    for (var i = 0; i < myKeys.length; i++) {
      var key = myKeys[i];
      if (!ecma.util.grep(key, keys)) {
        this.removeValue(key);
        count++;
      }
    }
    return count;
  };

  /**
   * @function merge
   */

  proto.merge = function (value) {
    if (value.isDirectory()) {
      // Directory values contain only stub-entries listing its contents
      this.crop(value.keys());
      var index = 0;
      value.iterate(function (itemKey, itemValue) {
        var myValue = this.getValue(itemKey);
        if (myValue) {
          // Recognize entries which have an updated mtime
          var mtime = itemValue.getAttribute('mtime');
          if (mtime) myValue.setAttribute('mtime', mtime);
          // Recognize items which have changed type
          var type = itemValue.getType();
          if (type != myValue.getType()) {
            this.removeValue(itemKey);
            this.setValue(itemKey, itemValue, index);
            this.executeAction('create', itemValue, 'change type ' + itemKey);
            myValue = this.getValue(itemKey);
          }
        } else {
          // Recognize new entries
          this.setValue(itemKey, itemValue);
          this.executeAction('create', itemValue, 'new stub ' + itemKey);
        }
        index++;
      }, this);
    } else {
      var rmCount = this.crop(value.keys());
      var index = 0;
      value.iterate(function (k, v) {
        var myValue = this.getValue(k);
        if (js.util.isDefined(myValue)) {
          myValue.merge(v);
        } else {
          this.setValue(k, v, index);
          var action = 'create';
          this.executeAction(action, v);
          if (ecma.util.isFunction(v.walk)) {
            v.walk(function (key, val, depth, addr, pval) {
              pval.executeAction(action, val);
            });
          }
        }
        index++;
      }, this);
    }
    return CNode.prototype.merge.apply(this, arguments);
  };

});
