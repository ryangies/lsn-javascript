/** @namespace action */
ECMAScript.Extend('action', function (ecma) {

  /**
   * addActionListener - Add a GLOBAL action listener.
   * Called on all class and derived instances.
   */

  this.addActionListener = function (klass, name, listener, scope, args) {
    if (!klass.prototype.globalActionListeners) {
      klass.prototype.globalActionListeners = [];
    }
    var inst = new klass();
    var al = inst.createActionListener(name, listener, scope, args);
    klass.prototype.globalActionListeners.push(al);
    return al;
  };

  /**
   * removeActionListener - Remove a GLOBAL action listener.
   *
   * TODO Looks like a script error, klass is not defined?!
   */

  this.removeActionListener = function (name, listener, scope) {
    if (!klass.prototype.globalActionListeners) return;
    var inst = new klass();
    return inst.removeActionListenerFrom(this.globalActionListeners, arguments);
  };

  /** ----------------------------------------------------------------------- */

  var proto = {};

  /**
   * @class ActionDispatcher
   * Base class for classes which wish to implement action callbacks.
   *
   *  function MyClass () {
   *    ecma.action.ActionDispatcher.apply(this);
   *  }
   *  var proto = ecma.lang.createPrototype(ecma.action.ActionDispatcher);
   *  MyClass.prototype = proto;
   */

  this.ActionDispatcher = function CActionDispatcher () {
    // Do not stomp during multiple inheritance
    if (!this.actionListeners) this.actionListeners = [];
  };

  this.ActionDispatcher.prototype = proto;

  /**
   * @function normalizeActionName
   * Used to allow fuzzy action names, e.g., C<'onComplete' == 'complete'>.
   *
   *  var name1 = object.normalizeActionName('onComplete');
   *  var name2 = object.normalizeActionName('complete');
   *  ecma.lang.assert(name1 == name2);
   */

  proto.normalizeActionName = function (name) {
    if (!name) return;
    if (!name.toLowerCase) return;
    return name.toLowerCase().replace(/^on/, '');
  };


  /**
   * createActionListener - Create a listener object
   */

  proto.createActionListener = function (name, listener, scope, args) {
    name = this.normalizeActionName(name);
    if (!listener) throw new Error('Action listener callback function required');
    if (typeof(listener) != 'function') throw new Error('Action listener callback must be a function');
    this.removeActionListener(name, listener, scope);
    return new ecma.action.ActionListener(this, name, listener, scope, args);
  };

  /**
   * @function addActionListener
   * Add add a callback for the given action name.
   *
   *  object.addActionListener(name, listener);
   *  object.addActionListener(name, listener, scope);
   *  object.addActionListener(name, listener, scope, args);
   *
   * Where:
   *
   *  name        <String>    Name of the action
   *  listener    <Function>  Callback function
   *  scope       <Object>    Callback scope
   *  args        <Array>     Callback arguments L<1>
   *
   * N<1> The provided arguments are concatenated B<after> any arguments
   * provided by the code which invokes the event.
   */

  proto.addActionListener = function (name, listener, scope, args) {
    var cbarr = ecma.lang.createCallbackArray(listener, scope, args);
    var al = this.createActionListener.apply(this, [name].concat(cbarr));
    this.actionListeners.push(al);
    return al;
  };

  /**
   * @function removeActionListener
   * Remove an action listener.
   *
   *  object.removeActionListener(name, listener);
   *  object.removeActionListener(name, listener, scope);
   *
   * Where:
   *
   *  name        <String>    Name of the action
   *  listener    <Function>  Callback function
   *  scope       <Object>    Callback scope
   *
   * All arguments must be the same as provided to the L<.addActionListener>
   * function.
   */

  proto.removeActionListener = function (name, listener, scope) {
    return this.removeActionListenerFrom(this.actionListeners, arguments);
  };

  proto.removeActionListenerFrom = function (listeners, argv) {
    var args = ecma.util.args(argv);
    var name = args.shift();
    var listener = args.shift();
    var scope = args.shift();
    if (typeof(name) == 'string') {
      name = this.normalizeActionName(name);
    } else {
      al = name;
      name = al.name;
      listener = al.listener;
      scope = al.scope;
    }
    for (var i = 0, props; props = listeners[i]; i++) {
      if (props.name !== name) continue;
      if (props.listener !== listener) continue;
      if (props.scope !== scope) continue;
      listeners.splice(i--, 1);
      break;
    }
  };

  proto.getActionListenersByName = function (name) {
    var result = [];
    if (this.globalActionListeners) {
      for (var i = 0, props; props = this.globalActionListeners[i]; i++) {
        if (props.name == name || props.name === '*') result.push(props);
      }
    }
    for (var i = 0, props; props = this.actionListeners[i]; i++) {
      if (props.name == name || props.name === '*') result.push(props);
    }
    return result;
  }

  /**
   * @function executeAction
   * Invoke the given action synchronously.
   *
   *  this.executeAction(name);
   *  this.executeAction(name, arg1...);
   *
   * @see L<.dispatchAction>
   */

  proto.executeAction = function () {
    var args = ecma.util.args(arguments);
    var actionEvent = this.createActionEvent(args.shift());
    var name = actionEvent.name;
    var group = this.getActionListenersByName(name);
    if (!group.length) return;
    args.unshift(actionEvent);
    ecma.util.step(group, this.executeActionListener, this, args);
  };

  proto.executeActionListener = function () {
    var argz = ecma.util.args(arguments);
    var listener = argz.shift();
    return listener.invoke.apply(listener, argz);
  };

  /**
   * @function dispatchAction
   * Invoke the given action synchronously.
   *
   *  this.dispatchAction(name);
   *  this.dispatchAction(name, arg1...);
   *
   * The difference between L<.dispatchAction> and L<.executeAction> is that
   * L<.dispatchAction> will apply each listener callback in a separate thread,
   * allowing the current thread to continue.  While this is ideal in most
   * situations, time-critical routines will prefer L<.executeAction>.
   */

  proto.dispatchAction = function (name) {
    var args = ecma.util.args(arguments);
    var actionEvent = this.createActionEvent(args.shift());
    var name = actionEvent.name;
    var group = this.getActionListenersByName(name);
    if (!group.length) return;
    args.unshift(actionEvent);
    ecma.util.step(group, this.dispatchActionListener, this, args);
  };

  proto.dispatchActionListener = function () {
    var argz = ecma.util.args(arguments);
    var listener = argz.shift();
    listener.spawn.apply(listener, argz);
  };

  proto.createActionEvent = function (arg1) {
    var actionEvent = null;
    if (ecma.util.isa(arg1, ecma.action.ActionEvent)) {
      actionEvent = arg1;
      actionEvent.setDispatcher(this);
    } else if (ecma.util.isAssociative(arg1)) {
      actionEvent = new ecma.action.ActionEvent();
      js.util.overlay(actionEvent, arg1);
      var name = this.normalizeActionName(arg1.name);
      actionEvent.setName(name);
      actionEvent.setDispatcher(this);
    } else {
      var name = this.normalizeActionName(arg1);
      actionEvent = new ecma.action.ActionEvent(name, this);
    }
    return actionEvent;
  };

  /**
   * @function dispatchClassAction
   *
   *  dispatchClassAction('onClick', ...);
   *
   * * Calls this instances C<onClick> method (case sensitive)
   * * Then executes the action listeners (not case sensitive)
   * * Only action listeners receive the C<ActionEvent> as their first-argument.
   */

  proto.dispatchClassAction = function () {
    var args = ecma.util.args(arguments);
    var action = args.shift();
    var funcName = ecma.util.isAssociative(action)
      ? action.name
      : action;
    var funcEx = undefined;
    try {
      if (typeof(this[funcName]) == 'function') {
        this[funcName].apply(this, args);
      }
    } catch (ex) {
      funcEx = ex;
    }
    this.dispatchAction.apply(this, arguments);
    if (funcEx) {
      throw funcEx;
    }
  };

  /**
   * @function executeClassAction
   *
   *  executeClassAction('onClick', ...);
   *
   * * Calls this instances C<onClick> method (case sensitive)
   * * Then executes the action listeners (not case sensitive)
   * * Only action listeners receive the C<ActionEvent> as their first-argument.
   */

  proto.executeClassAction = function () {
    var args = ecma.util.args(arguments);
    var action = args.shift();
    var funcName = ecma.util.isAssociative(action)
      ? action.name
      : action;
    var funcEx = undefined;
    try {
      if (typeof(this[funcName]) == 'function') {
        this[funcName].apply(this, args);
      }
    } catch (ex) {
      funcEx = ex;
    }
    this.executeAction.apply(this, arguments);
    if (funcEx) {
      throw funcEx;
    }
  };

});

/*
if (!(listener.listener instanceof Function)) {
  this.actionListeners.splice(i--, 1);
  continue;
}
*/
