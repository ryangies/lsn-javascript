/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Move
   */

  this.Move = function () {
    CBase.call(this, 'move');
    this.argspec = ['target', 'dest'];
  };

  var Move = this.Move.prototype = ecma.lang.createPrototype(CBase);

  Move.process = function (rh) {
    var srcAddr = rh.getString('/head/source');
    this.executeAction('remove', srcAddr);
    CBase.prototype.process.apply(this, arguments);
  };

});
