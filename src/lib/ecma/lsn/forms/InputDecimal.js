/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputBase = this.InputBase;

  var _proto = ecma.lang.createPrototype(CInputBase);

  /**
   * @class InputDecimal
   */

  this.InputDecimal = function (elem, digits) {
    CInputBase.apply(this, [elem]);
    this.digits = ecma.util.defined(digits) ? digits : 2;
    this.value = this.emptyValue = new Number();
  };

  this.InputDecimal.prototype = _proto;

  _proto.marshal = function (dataValue) {
    return dataValue.toFixed(this.digits);
  };

  _proto.unmarshal = function (ctrlValue) {
    return new Number(ctrlValue);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Number(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf();
  };

});
