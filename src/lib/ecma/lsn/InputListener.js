/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;
  var proto = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @class InputListener
   */

  this.InputListener = function (elem) {
    CActionDispatcher.apply(this);
    this.elem = ecma.dom.getElement(elem);
    this.setValue();
    this.events = [
      new ecma.dom.EventListener(elem, 'keydown', this.onKeyDown, this),
      new ecma.dom.EventListener(elem, 'focus', this.checkValue, this),
      new ecma.dom.EventListener(elem, 'blur', this.checkValue, this),
      new ecma.dom.EventListener(elem, 'propertychange', this.checkValue, this)
    ];
    this.checkInterval = 75;
    this.checkTimeout = 10 * this.checkInterval;
    this.checkCount = 0;
  };

  this.InputListener.prototype = proto;

  proto.setValue = function () {
    this.currentValue = ecma.dom.getValue(this.elem);
  };

  proto.onKeyDown = function (event) {
    if (this.intervalId) return;
    this.intervalId = ecma.dom.setInterval(this.checkValue, 
      this.checkInterval, this);
  };

  proto.checkValue = function () {
//  ecma.console.log('check value');
    var value = ecma.dom.getValue(this.elem);
    if (this.currentValue != value) {
      this.clearInterval();
      var prevValue = this.currentValue;
      this.setValue();
      this.dispatchAction('change', this.currentValue, prevValue);
    } else {
      this.checkCount++;
      if ((this.checkInterval * this.checkCount) > this.checkTimeout) {
//      ecma.console.log('-timeout');
        this.clearInterval();
      }
    }
  };

  proto.clearInterval = function () {
//  ecma.console.log('-clear');
    ecma.dom.clearInterval(this.intervalId);
    this.intervalId = null;
    this.checkCount = 0;
  };

  /**
   * @function destroy
   */

  proto.destroy = function () {
    this.clearInterval();
    for (var i = 0; i < this.events.length; i++) {
      try {
        this.events[i].remove();
      } catch (ex) {
      }
    }
    this.events = [];
  };

});
