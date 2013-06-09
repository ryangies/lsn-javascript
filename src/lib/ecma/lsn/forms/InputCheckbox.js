/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputBase = this.InputBase;

  var _proto = ecma.lang.createPrototype(CInputBase);

  this.InputCheckbox = function (elem) {
    CInputBase.apply(this, [elem]);
    this.value = this.emptyValue = new Boolean(false);
  };

  this.InputCheckbox.prototype = _proto;

  _proto.marshal = function (dataValue) {
    return dataValue.valueOf();
  };

  _proto.unmarshal = function (ctrlValue) {
    var bPrimitive = ctrlValue == 'off'
      ? false
      : ctrlValue
        ? true
        : false;
    return new Boolean(bPrimitive);
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Boolean(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().valueOf() ? 1 : 0;
  };

});
