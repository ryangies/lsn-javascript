/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class ElementAdaptor
   */

  this.ElementAdaptor = function () {
    ecma.action.ActionDispatcher.apply(this);
  };

  var _proto = this.ElementAdaptor.prototype = ecma.lang.createPrototype(
    ecma.action.ActionDispatcher
  );

  /**
   * @function attach
   * Attach this adaptor to the provided element.
   *
   *  adaptor.attach(elem);
   *
   */

  _proto.attach = ecma.lang.createAbstractFunction();

});
