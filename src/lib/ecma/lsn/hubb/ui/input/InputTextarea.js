/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  var CInput = ecma.lsn.forms.InputTextarea;
  var CControl = ecma.hubb.ui.input.Control;

  var _css = {
    'margin-bottom':  '0',
    'border-width':   '1px',
    'border-style':   'solid',
    'border-color':   'black',
    'padding-left':   '2px'
  };

  /**
   * @class InputTextarea
   */

  this.InputTextarea = function (node) {
    var input = new CInput(ecma.dom.createElement('textarea', {'style': _css}));
    CControl.apply(this, [node, input])
    this.rszta = new ecma.hubb.ui.input.ResizeTextarea(this.input.elem);
    this.appendElements(this.rszta.getElements());
  };

  var _proto = this.InputTextarea.prototype = ecma.lang.createPrototype(
    CControl
  );

  _proto.setWidth = function (width) {
    CControl.prototype.setWidth.apply(this, arguments);
    js.dom.setStyle(this.rszta.elem, 'width', width);
  };

});
