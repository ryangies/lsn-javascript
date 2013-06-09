/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputBase = this.InputBase;

  var _proto = ecma.lang.createPrototype(CInputBase);

  /**
   * @class InputText
   */

  this.InputText = function (elem) {
    CInputBase.apply(this, [elem]);
    this.value = this.emptyValue = new String();
  };

  this.InputText.prototype = _proto;

  _proto.deserialize = function (storedValue) {
    this.setValue(ecma.data.entities.encode(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return ecma.data.entities.decode(this.getValue(), true);
  };

});
