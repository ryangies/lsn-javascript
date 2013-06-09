/** @namespace action */
ECMAScript.Extend('action', function (ecma) {

  var CActionListener = ecma.action.ActionListener;

  var _package = this;
  var _super = CActionListener.prototype;
  var _proto = ecma.lang.createPrototype(CActionListener)

  /**
   * @class Handler
   */

  _package.Handler = function () {
    CActionListener.apply(this, arguments);
  };

  _package.Handler.prototype = _proto;

  /**
   * @function remove
   * Remove this listener from its dispatcher.
   */

  _proto.remove = function (name) {
    return this.dispatch.removeHandler(this);
  };

});
