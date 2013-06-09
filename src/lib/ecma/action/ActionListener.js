/** @namespace action */
ECMAScript.Extend('action', function (ecma) {

  var proto = {};

  /**
   * @class ActionListener
   * Represents a listener which has been added to an L<ecma.action.ActionDispatcher>
   */

  this.ActionListener = function (dispatch, name, listener, scope, args) {
    // Create callback array so to support single-argument-callback-bundles
    var cb = ecma.lang.createCallbackArray(listener, scope, args);
    this.dispatch = dispatch;
    this.name = name;
    this.listener = cb[0];
    this.scope = cb[1];
    this.args = cb[2];
//  this.stack = ecma.error.getStackTrace(); // capture for later
  };

  this.ActionListener.prototype = proto;

  /**
   * @function invoke
   * Execute this listener.
   */

  proto.invoke = function () {
    var argz = ecma.util.args(arguments);
    if (this.args && this.args.length) argz = argz.concat(this.args);
    return this.listener.apply(this.scope || this, argz);
  };

  /**
   * @function spawn
   * Spawn a new thread which invokes this listener.
   */

  proto.spawn = function () {
    var argz = ecma.util.args(arguments);
    if (this.args) argz = argz.concat(this.args);
    ecma.thread.spawn(this.listener, this.scope || this, argz);
//  ecma.thread.spawn(this.listener, this.scope || this, argz, [this.onException, this]);
  };

  /**
   * @function remove
   * Remove this listener from its dispatcher.
   */

  proto.remove = function (name) {
    return this.dispatch.removeActionListener(this);
  };

  /**
   * @function onException
   * Handle exceptions which occur while invoking this listener.  One fatal
   * exception is when the listener function as been freed.  Either way, we
   * will remove ourselves from the dispatcher.
   *
   *  @param ex <Error> the exception
   */

  proto.onException = function (ex) {
    var logMessage = ex.toString() + ' (while invoking an action listener)';
    if (ex.toString().match(/freed script/)) return this.remove();
    throw ex;
  };

});
