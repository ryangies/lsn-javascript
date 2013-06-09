/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Fetch
   */

  this.Fetch = function () {
    CBase.call(this, 'fetch');
    this.argspec = ['target'];
  };

  var Fetch = this.Fetch.prototype = ecma.lang.createPrototype(CBase);

  /**
   * mtime
   * branch
   * root
   */

});
