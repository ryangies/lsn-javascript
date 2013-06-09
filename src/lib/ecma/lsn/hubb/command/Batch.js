/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Batch
   */

  this.Batch = function () {
    CBase.call(this, 'batch');
    this.commands = [];
  };

  var Batch = this.Batch.prototype = ecma.lang.createPrototype(CBase);

  Batch.addCommand = function () {
    var args = ecma.util.args(arguments);
    var verb = args.shift();
    var cmd = ecma.lsn.hubb.command.createInstance(verb);
    cmd.setArguments.apply(cmd, args);
    cmd.setParameter('verb', verb);
    this.commands.push(cmd);
    return cmd;
  };

  Batch.getParameters = function () {
    var result = [];
    for (var i = 0, cmd; cmd = this.commands[i]; i++) {
      result.push(cmd.getParameters());
    }
    return result;
  };

  Batch.process = function (rh) {
    var result = rh.get('body').values();
    ecma.lang.assert(result.length == this.commands.length);
    for (var i = 0; i < result.length; i++) {
      this.commands[i].process(result[i]);
    }
    this.result = this.commands; // each command now contains its own result
  };

});
