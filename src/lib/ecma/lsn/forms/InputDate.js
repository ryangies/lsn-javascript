/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputBase = this.InputBase;

  var _proto = ecma.lang.createPrototype(CInputBase);

  /**
   * @class InputDate
   */

  this.InputDate = function (elem, format) {
    CInputBase.apply(this, [elem]);
    this.format = format || 'm/d/yyyy';
    this.invalidValue = new Date(0);
    this.value = this.emptyValue = new Date();
  };

  this.InputDate.prototype = _proto;

  _proto.marshal = function (dataValue) {
    try {
      return ecma.date.format(dataValue, this.format);
    } catch (ex) {
      js.console.log(ex);
      return ecma.date.format(this.invalidValue, this.format);
    }
  };

  _proto.unmarshal = function (ctrlValue) {
    var now = new Date();
    var parts = ctrlValue.match(/(\d+)/g);
    var date;
    if (parts) {
      var m = parts[0] || now.getMonth();
      var d = parts[1] || now.getDate();
      var y = parts[2] || now.getFullYear();
      var yyyy;
      y = ecma.util.pad(new String(y), 2);
      var len = 4 - y.length;
      if (len < 0) yyyy = y.substr(0, 4);
      if (len == 0) yyyy = y;
      if (len > 0) {
        var prefix = new String(now.getFullYear()).substr(0, len);
        yyyy = prefix + y;
      }
      m = m - 1;
      return new Date(yyyy, m, d);
    } else {
      return now;
    }
  };

  _proto.deserialize = function (storedValue) {
    this.setValue(new Date(storedValue));
    return this;
  };

  _proto.serialize = function () {
    return this.getValue().toUTCString();
  };

});
