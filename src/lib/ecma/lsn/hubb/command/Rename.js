/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Rename
   */

  this.Rename = function () {
    CBase.call(this, 'rename');
    this.argspec = ['target', 'name'];
  };

  var Rename = this.Rename.prototype = ecma.lang.createPrototype(CBase);

  Rename.fixup = function (rh) {
    var meta = rh.get('/head/meta').toObject();
    this.executeAction('rename', meta);
  };

});
