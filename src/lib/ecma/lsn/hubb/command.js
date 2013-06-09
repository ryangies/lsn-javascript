/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var _verbToClass = {
    'fetch': ecma.lsn.hubb.command.Fetch,
    'store': ecma.lsn.hubb.command.Store,
    'update': ecma.lsn.hubb.command.Update,
    'create': ecma.lsn.hubb.command.Create,
    'insert': ecma.lsn.hubb.command.Insert,
    'remove': ecma.lsn.hubb.command.Remove,
    'rename': ecma.lsn.hubb.command.Rename,
    'copy': ecma.lsn.hubb.command.Copy,
    'move': ecma.lsn.hubb.command.Move,
    'download': ecma.lsn.hubb.command.Download,
    'progress': ecma.lsn.hubb.command.Progress,
    'reorder': ecma.lsn.hubb.command.Reorder,
    'batch': ecma.lsn.hubb.command.Batch
  };

  /**
   * @function createInstance
   *
   *  @param verb <String>
   *
   * Create a command instance given the /api/hub (REST) verb.
   */

  this.createInstance = function (verb) {
    var ctor = _verbToClass[verb];
    if (!ctor) throw new Error('Missing implementation');
    return ecma.lang.createObject(ctor);
  };

});
