/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  var CInput = ecma.lsn.forms.InputText;
  var CControl = ecma.hubb.ui.input.Control;

  var _css = {
    'margin-bottom':  '0',
    'border-width':   '1px',
    'border-style':   'solid',
    'border-color':   'black',
    'padding':        '2px'
  };

  /**
   * @class InputText
   */

  this.InputText = function (node) {
    var input = new CInput(ecma.dom.createElement('input', {'style': _css}));
    CControl.apply(this, [node, input])
  };

  var _proto = this.InputText.prototype = ecma.lang.createPrototype(
    CControl
  );

});
