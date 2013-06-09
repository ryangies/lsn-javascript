/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  /**
   * @class Control
   */

  this.Control = function (node, input) {
    this.node = node;
    this.input = input;
    this.elems = [input.elem];
    this.statusIcon = new ecma.hubb.ui.input.StatusIcon();
    this.appendElements(this.statusIcon.getElements());
    this.input.deserialize(node.getValue());
    this.input.addActionListener('onChange', this.save, this);
  };

  var _proto = this.Control.prototype = {};

  _proto.getElements = function () {
    return this.elems;
  };

  _proto.appendElements = function (elems) {
    this.elems = this.elems.concat(elems);
  };

  _proto.save = function () {
    this.node.setValue(this.input.serialize());
    ecma.dom.setAttribute(this.input.elem, 'disabled', 'disabled');
    this.statusIcon.showActive();
    ecma.hubb.getInstance().store(
      this.node.getAddress(),
      this.node.getValue(),
      [this.onSaveComplete, this]
    );
  };

  _proto.onSaveComplete = function () {
    ecma.dom.removeAttribute(this.input.elem, 'disabled');
    this.statusIcon.showComplete();
  };

  _proto.setWidth = function (width) {
    js.dom.setStyle(this.input.elem, 'width', width);
  };

});
