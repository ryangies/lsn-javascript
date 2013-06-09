/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Create
   */

  this.Create = function () {
    CBase.call(this, 'create');
    this.argspec = ['target', 'name', 'type', 'value'];
  };

  var Create = this.Create.prototype = ecma.lang.createPrototype(CBase);

});
