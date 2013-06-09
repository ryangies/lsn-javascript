/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CHashNode = ecma.hubb.HashNode;

  /**
   * @class RootNode
   */

  this.RootNode = function (db, addr) {
    CHashNode.apply(this);
    this.setAttribute('addr', addr);
    this.setAttribute('type', 'directory');
    this.db = db;
  };

  var proto = ecma.lang.createPrototype(ecma.hubb.HashNode);

  this.RootNode.prototype = proto;

  proto._fetch = function (addr, cb) {
    arguments[0] = this.db.relativeAddress(addr);
    this.db.fetch.apply(this.db, arguments);
  };

});
