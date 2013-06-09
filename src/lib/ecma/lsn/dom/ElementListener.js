/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var _package = this;

  /**
   * @class ElementListener
   */

  _package.ElementListener = function (selector, element, eventName, callback) {
    this.selector = selector;
    this.element = element;
    this.callback = callback;
    this.eventName = eventName;
    ecma.dom.addEventListener(this.element, this.eventName, this.onEvent, this);
  };

  var _proto = _package.ElementListener.prototype = {};

  /**
   * @function remove
   */

  _proto.remove = function () {
    ecma.dom.removeEventListener(this.element, this.eventName, this.onEvent, this);
  };

  /**
   * @function onEvent
   */

  _proto.onEvent = function (event) {
    ecma.lang.callback(this.callback, this, [event, this.element]);
  };

});
