/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  var _imgReady     = '/res/icons/16x16/status/blank.gif';
  var _imgActive    = '/res/icons/16x16/status/saving.gif';
  var _imgComplete  = '/res/icons/16x16/status/checkmark.gif';

  var _css = {
    'margin':         '0 2px',
    'vertical-align': 'middle',
    'border':         'none'
  };

  /**
   * @class StatusIcon
   */

  this.StatusIcon = function (node) {
    this.elem = ecma.dom.createElement('img', {
      'src': _imgReady,
      'width': 16,
      'height': 16,
      'border': 0,
      'style': _css
    });
    this.ui = [this.elem];
    this.fade = new ecma.fx.effects.Opacify(this.elem, 1, .25, 1000);
  };

  var _proto = this.StatusIcon.prototype = ecma.lang.createPrototype();

  _proto.getElements = function () {
    return this.ui;
  };

  _proto.showActive = function () {
    ecma.dom.setOpacity(this.elem, 1);
    ecma.dom.setAttribute(this.elem, 'src', _imgActive);
  };

  _proto.showComplete = function () {
    ecma.dom.setOpacity(this.elem, 1);
    ecma.dom.setAttribute(this.elem, 'src', _imgComplete);
    ecma.dom.setTimeout(this.fade.start, 1000, this.fade);
  };

  _proto.showReady = function () {
    ecma.dom.setOpacity(this.elem, 1);
    ecma.dom.setAttribute(this.elem, 'src', _imgReady);
  };

});
