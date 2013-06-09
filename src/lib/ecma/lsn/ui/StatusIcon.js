/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var _imgReady       = '/res/icons/16x16/status/blank.gif';
  var _imgActive      = '/res/icons/16x16/status/saving.gif';
  var _imgComplete    = '/res/icons/16x16/status/checkmark.gif';
  var _imgError       = '/res/icons/16x16/actions/document-close.png';

  var _css = {
    'margin':         '0 2px',
    'vertical-align': 'middle',
    'border':         'none'
  };

  /**
   * @class StatusIcon
   */

  this.StatusIcon = function () {
    this.elem = ecma.dom.createElement('img', {
      'src': _imgReady,
      'width': 16,
      'height': 16,
      'border': 0,
      'style': _css
    });
    this.fade = new ecma.fx.effects.Opacify(this.elem, 1, .25, 1000);
  };

  var _proto = this.StatusIcon.prototype = ecma.lang.createPrototype();

  _proto.getRootElement = function () {
    return this.elem;
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

  _proto.showError = function () {
    ecma.dom.setOpacity(this.elem, 1);
    ecma.dom.setAttribute(this.elem, 'src', _imgError);
    ecma.dom.setTimeout(this.fade.start, 1000, this.fade);
  };

});
