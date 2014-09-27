/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Update
   */

  this.Update = function () {
    CBase.call(this, 'update');
    this.argspec = ['target', 'values', 'mtime', 'force', 'origins'];
  };

  var Update = this.Update.prototype = ecma.lang.createPrototype(CBase);

});
