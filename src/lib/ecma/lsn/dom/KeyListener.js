/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class KeyListener
   * Keypress listener
   *
   *  var kl = new ecma.dom.KeyListener(elem, key, func);
   *  var kl = new ecma.dom.KeyListener(elem, key, [cb]);
   *  var kl = new ecma.dom.KeyListener(elem, key, func, scope);
   *  var kl = new ecma.dom.KeyListener(elem, key, func, scope, args);
   *  ...
   *  kl.destroy(); // detaches events
   */

  var CKeyPress = ecma.dom.KeyPress;

  this.KeyListener = function (elem, key, func, scope, args) {
    CKeyPress.call(this);
    this.elem = ecma.dom.getElement(elem);
    this.key = key;
    this.cb = ecma.lang.createCallbackArray(func, scope, args);
    this.attach(this.elem);
  };

  var proto = this.KeyListener.prototype = ecma.lang.createPrototype(
    CKeyPress
  );

  proto.getHandlers = function (seq) {
    var match = false;
    if (typeof(this.key) == 'function') {
      match = ecma.lang.callback(this.key, null, [seq]);
    } else {
      match = seq.numeric == this.key || seq.ascii == this.key;
    }
    return match ? [this.cb] : undefined;
  };

  proto.remove = function () {
    this.detach();
  };

  proto.destroy = function () {
    this.remove();
  };

});
