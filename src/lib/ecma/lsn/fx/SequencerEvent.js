/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  var CActionEvent = ecma.action.ActionEvent;

  var proto = ecma.lang.createPrototype(CActionEvent);

  /**
   * @class SequencerEvent
   */

  this.SequencerEvent = function (name, dispatcher) {
    CActionEvent.apply(this, arguments);
  };

  this.SequencerEvent.prototype = proto;

});
