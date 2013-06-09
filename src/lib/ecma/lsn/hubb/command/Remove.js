/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Remove
   */

  this.Remove = function () {
    CBase.call(this, 'remove');
    this.argspec = ['target'];
  };

  var Remove = this.Remove.prototype = ecma.lang.createPrototype(CBase);

  Remove.fixup = function (rh) {
    var meta = rh.get('/head/meta').toObject();
    this.executeAction('remove', meta.addr, meta);
  };

});
