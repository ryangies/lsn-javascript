/** @namespace sys */
ECMAScript.extend('sys', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  var _proto = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @class System
   */

  this.System = function () {
    CActionDispatcher.apply(this);
  };

  this.System.prototype = _proto;

  _proto.alert = function (message) {
    try {
      this.dispatchAction('alert', arguments);
      throw new Error('notimpl');
    } catch (ex) {
      ecma.window.alert(message);
    }
  };

  _proto.confirm = function (message) {
    var result = undefined;
    try {
      this.dispatchAction('confirm', arguments);
      throw new Error('notimpl');
    } catch (ex) {
      result = ecma.window.confirm(message);
    }
    return result;
  };

  _proto.prompt = function (text, value) {
    var result = undefined;
    try {
      this.dispatchAction('prompt', arguments);
      throw new Error('notimpl');
    } catch (ex) {
      result = ecma.window.prompt(text, value);
    }
    return result;
  };

});
