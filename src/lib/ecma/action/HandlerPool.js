/** @namespace action */
ECMAScript.Extend('action', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  var _package = this;
  var _peer = CActionDispatcher.prototype;
  var _proto = {}

  _proto.normalizeActionName = _peer.normalizeActionName;
  _proto.removeHandlerFrom = _peer.removeActionListenerFrom;
  _proto.executeHandler = _peer.executeActionListener;
  _proto.dispatchHandler = _peer.dispatchActionListener;
  _proto.createHandlerEvent = _peer.createActionEvent;

  /**
   * @class HandlerPool
   * Base class for classes which wish to receive and invoke handlers.
   *
   *  function MyClass () {
   *    ecma.action.HandlerPool.apply(this);
   *  }
   *  var proto = ecma.lang.createPrototype(ecma.action.HandlerPool);
   *  MyClass.prototype = proto;
   */

  _package.HandlerPool = function (pool) {
    // Do not stomp during multiple inheritance
    if (!this.handlerPool) this.handlerPool = [];
    if (!this.handlerPoolChain) this.handlerPoolChain = [];
    this.handlerPoolChain.push(this);
    if (pool) this.handlerPoolChain.push(pool);
  };

  _package.HandlerPool.prototype = _proto;


  _proto.createHandler = function (name, listener, scope, args) {
    name = this.normalizeActionName(name);
    if (!listener) throw new Error('Callback required');
    if (typeof(listener) != 'function') throw new Error('Callback must be a function');
    this.removeHandler(name, listener, scope);
    return new ecma.action.Handler(this, name, listener, scope, args);
  };

  _proto.registerHandler = function (name, listener, scope, args) {
    var cbarr = ecma.lang.createCallbackArray(listener, scope, args);
    var h = this.createHandler.apply(this, [name].concat(cbarr));
    this.handlerPool.push(h);
    return h;
  };

  _proto.removeHandler = function (name, listener, scope) {
    return this.removeHandlerFrom(this.handlerPool, arguments);
  };

  _proto.getHandlersByName = function (name) {
    var result = [];
    for (var p = 0, pool; pool = this.handlerPoolChain[p]; p++) {
      for (var i = 0, props; props = pool.handlerPool[i]; i++) {
        if (props.name == name || props.name === '*') result.push(props);
      }
    }
    return result;
  }

  _proto.invokeHandler = function () {
    var args = ecma.util.args(arguments);
    var actionEvent = this.createHandlerEvent(args.shift());
    var name = actionEvent.name;
    var group = this.getHandlersByName(name);
    if (!group.length) return false;
    args.unshift(actionEvent);
    var result = false; // Action has been handled when result is true
    for (var i = 0; !result && i < group.length; i++) {
      args.unshift(group[i]);
      result = this.executeHandler.apply(this, args);
      args.shift();
    }
    return result;
  };

});
