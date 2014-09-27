/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Store
   */

  this.Store = function () {
    CBase.call(this, 'store');
    this.argspec = ['target', 'value', 'mtime', 'force', 'origin'];
  };

  var Store = this.Store.prototype = ecma.lang.createPrototype(CBase);

});
