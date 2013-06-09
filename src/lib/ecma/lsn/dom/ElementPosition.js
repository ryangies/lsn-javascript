/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var _package = this;

  function _getTop (elt) {
    return _getOffset(elt, 'Top', true) - _getScroll(elt, 'Top', true);
  }

  function _getLeft (elt) {
    return _getOffset(elt, 'Left', true) - _getScroll(elt, 'Left', true);
  }

  function _getOffset (elt, which, bubbles) {
    if (!elt) return 0;
    var result = elt['offset' + which] || 0;
    if (bubbles) {
      result += _getOffset(elt.offsetParent, which, bubbles);
    }
    return isNaN(result) ? 0 : result;
  }

  function _getScroll (elt, which, bubbles) {
    if (!elt || elt.tagName == 'BODY') return 0;
    var result = elt['scroll' + which] || 0;
    if (bubbles) {
      result += _getScroll(elt.parentNode, which, bubbles);
    }
    return isNaN(result) ? 0 : result;
  }

  function _getBounds (elt) {
    var t = _getOffset(elt, 'Top', true) - _getScroll(elt.parentNode, 'Top', true);
    var l = _getOffset(elt, 'Left', true) - _getScroll(elt.parentNode, 'Left', true);
    var w = _getOffset(elt, 'Width');
    var h = _getOffset(elt, 'Height');
    var result = {
      'top': t,
      'left': l,
      'width': w,
      'height': h,
      'bottom': t + h,
      'right': l + w
    };
    return result;
  }

  function _isWithinBounds (pos, bounds) {
      return ((pos.top < bounds.top)
          || (pos.top > bounds.bottom)
          || (pos.left < bounds.left)
          || (pos.left > bounds.right)) ? false : true;
  }

  function _isVisible (pos, elt) {
    while (ecma.dom.node.isElement(elt) && (elt.tagName != 'BODY')) {
      var bounds = _getBounds(elt);
      if (!_isWithinBounds(pos, bounds)) return false;
      if (ecma.dom.getStyle(elt, 'display') == 'none') return false;
      if (ecma.dom.getStyle(elt, 'visibility') == 'hidden') return false;
      if (ecma.dom.getOpacity(elt) == 0) return false;
      elt = elt.parentNode;
    }
    return true;
  }

  /**
   * @class ElementPosition
   */

  var _proto;

  _package.ElementPosition = function (elt) {
    this.elt = elt;
    this.top = 0;
    this.left = 0;
    this.width = 0;
    this.height = 0;
    this.bottom = 0;
    this.right = 0;
    this.visible = false;
    this.refresh();
  }

  _proto = _package.ElementPosition.prototype = ecma.lang.createPrototype(
  );

  _proto.refresh = function () {
    this.top = _getTop(this.elt);
    this.left = _getLeft(this.elt);
    this.width = _getOffset(this.elt, 'Width');
    this.height = _getOffset(this.elt, 'Height');
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
    this.visible = _isVisible(this, this.elt.parentNode);
    return this;
  };

});
