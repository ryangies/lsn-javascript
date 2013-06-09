/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class EventListener
   * An event listener which is bound a particular scope.
   *
   *  var listener = new ecma.dom.EventListener(elem, listener);
   *  var listener = new ecma.dom.EventListener(elem, listener, scope);
   *  var listener = new ecma.dom.EventListener(elem, listener, scope, args);
   *  var listener = new ecma.dom.EventListener(elem, listener, scope, args, useCapture);
   *
   * @param target      <Element>   Target element
   * @param type        <String>    Event type
   * @param listener    <Function>  Callback function
   * @param scope       <Object>    Callback scope
   * @param args        <Array>     Arguments (appended after event parameter)
   * @param useCapture  <Boolean>   Use capture
   *
   * Example:
   *
   *  function MyClass (elem) {
   *    this.listener = new ecma.dom.EventListener(btn1, 'click', this.onClick, this);
   *  }
   *  MyClass.prototype = {
   *    'onClick': function (event) {
   *      if (confirm('Remove event listener?')) {
   *        this.destroy();
   *      }
   *    },
   *    'destroy': function () {
   *      this.listener.remove();
   *    }
   *  };
   *  var hander = new MyClass(ecma.dom.getElement('btn1'));
   *  ecma.dom.removeElement('btn1');
   */

  this.EventListener = function (target, type, listener, scope, args, useCapture) {
    this.target = ecma.dom.getElement(target);
    this.type = type;
    this.scope = scope;
    this.useCapture = useCapture;
    this.func = ecma.dom.addEventListener(this.target, this.type, listener, 
      this.scope, args, this.useCapture);
  };

  var proto = this.EventListener.prototype = {};

  proto.remove = function () {
    ecma.dom.removeEventListener(this.target, this.type, this.func, this.scope, this.useCapture);
  };

});
