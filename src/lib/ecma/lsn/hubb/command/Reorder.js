/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Reorder
   */

  this.Reorder = function () {
    CBase.call(this, 'reorder');
    this.argspec = ['target', 'value'];
  };

  var Reorder = this.Reorder.prototype = ecma.lang.createPrototype(CBase);

  Reorder.fixup = function (rh) {
    var meta = rh.getObject('/head/meta');
    var keys = rh.getObject('/body');
    this.executeAction('reorder', meta.addr, keys, meta);
  };

});
