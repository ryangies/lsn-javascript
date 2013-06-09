/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  var CInput = ecma.lsn.forms.InputBoolean;
  var CControl = ecma.hubb.ui.input.Control;

  var _css = null;

  function _initStyles () {
    if (_css) return;
    _css = new ecma.dom.StyleSheet();
    _css.createRule('select.true', {'color':'green', 'font-weight':'bold'});
    _css.createRule('select.false', {'color':'black'});
    _css.createRule('select option', {'color':'black', 'font-weight':'normal'});
  };

  /**
   * @class InputBoolean
   */

  this.InputBoolean = function (node) {
    _initStyles();
    var input = new CInput(ecma.dom.createElement('select', [
      'option', {'value': 0, 'innerHTML': 'False'},
      'option', {'value': 1, 'innerHTML': 'True'},
    ]));
    CControl.apply(this, [node, input])
    new ecma.dom.EventListener(input.elem, 'onChange', this.updateUI, this);
    this.updateUI();
  };

  var _proto = this.InputBoolean.prototype = ecma.lang.createPrototype(
    CControl
  );

  _proto.updateUI = function () {
    var className = this.input.getValue().valueOf() ? 'true' : 'false';
    ecma.dom.setClassName(this.input.elem, className);
  };

});
