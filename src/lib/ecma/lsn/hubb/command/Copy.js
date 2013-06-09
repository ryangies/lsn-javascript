/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Copy
   */

  this.Copy = function () {
    CBase.call(this, 'copy');
    this.argspec = ['target', 'dest'];
  };

  var Copy = this.Copy.prototype = ecma.lang.createPrototype(CBase);

});
