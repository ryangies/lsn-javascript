/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputBase = this.InputBase;

  var _proto = ecma.lang.createPrototype(CInputBase);

  /**
   * @class InputBoolean
   */

  this.InputBoolean = function (elem) {
    CInputBase.apply(this, [elem]);
    this.value = this.emptyValue = new Boolean();
  };

  this.InputBoolean.prototype = _proto;

  _proto.marshal = function (dataValue) {
    try {
      return dataValue.valueOf() ? 1 : 0;
    } catch (ex) {
      js.console.log(ex);
      return 0;
    }
  };

  _proto.unmarshal = function (ctrlValue) {
    return new Boolean(ecma.util.asInt(ctrlValue));
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Boolean(ecma.util.asInt(storedValue)));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf() ? '1' : '0';
  };

});
