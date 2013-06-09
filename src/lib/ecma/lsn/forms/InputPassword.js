/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  var CInputText = this.InputText;

  var _proto = ecma.lang.createPrototype(CInputText);

  this.InputPassword = function (elem) {
    CInputText.apply(this, [elem]);
  };

  this.InputPassword.prototype = _proto;

});
