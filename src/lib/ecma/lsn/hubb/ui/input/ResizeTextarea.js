/** @namespace hubb.ui.input */
ECMAScript.Extend('hubb.ui.input', function (ecma) {

  var _proto = {};

  var _css = {
    'margin-top':   '0',
    'padding':      '0 1px',
    'height':       '3px',
    'font-size':    '0',
    'line-height':  '0',
    'cursor':       'n-resize',
    'border-width': '0 1px 1px 1px',
    'border-style': 'solid',
    'border-color': 'black',
    'background-color': 'gray'
  };

  /**
   * @class ResizeTextarea
   */

  this.ResizeTextarea = function (textarea) {
    this.textarea = ecma.dom.getElement(textarea);
    this.mask = new ecma.lsn.Mask({opacity:0,cursor:'s-resize'});
    this.dims = {h: undefined};
    this.elem = ecma.dom.createElement('div.rszta', {'style': _css});
    this.handle = new ecma.lsn.DragHandle(this.elem, {
      'onMouseMove': [this.onMouseMove, this],
      'onMouseDown': [this.onMouseDown, this],
      'onMouseUp': [this.onMouseUp, this]
    });
    this.ui = [this.elem]
  };

  this.ResizeTextarea.prototype = _proto;

  _proto.getElements = function () {
    return this.ui;
  };

  _proto.onMouseMove = function (event, dh) {
    ecma.dom.stopEvent(event);
    var h = Math.max(this.dims.h + dh.delta_y, 30);
    ecma.dom.setStyle(this.textarea, 'height', h + 'px');
  };

  _proto.onMouseDown = function (event, dh) {
    ecma.dom.stopEvent(event);
    this.dims.h = ecma.dom.getHeight(this.textarea);
    this.mask.show();
  };

  _proto.onMouseUp = function (event, dh) {
    ecma.dom.stopEvent(event);
    this.mask.hide();
  };

});
