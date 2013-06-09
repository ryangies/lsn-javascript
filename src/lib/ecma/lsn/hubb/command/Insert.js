/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Insert
   */

  this.Insert = function () {
    CBase.call(this, 'insert');
    this.argspec = ['target', 'index', 'src'];
  };

  var Insert = this.Insert.prototype = ecma.lang.createPrototype(CBase);

});
