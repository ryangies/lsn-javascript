/** @namespace action */
ECMAScript.Extend('action', function (ecma) {

  /**
   * @class ActionEvent
   * Event object for ActionListener dispatched events.
   * @param name        <String>                        The normalized name of the action.
   * @param dispatcher  <ecma.action.ActionDispatcher>  The invoking dispatcher object.
   */

  var proto = {};

  this.ActionEvent = function (name, dispatcher) {
    this.name = null;
    this.dispatcher = null;
    this.setName(name);
    this.setDispatcher(dispatcher);
  };

  this.ActionEvent.prototype = proto;

  proto.getName = function () {
    return this.name;
  };

  proto.setName = function (name) {
    return this.name = name;
  };

  proto.getDispatcher = function () {
    return this.dispatcher;
  };

  proto.setDispatcher = function (dispatcher) {
    return this.dispatcher = dispatcher;
  };

});
