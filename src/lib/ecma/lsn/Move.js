/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var _package = this;

  /**
   * @function setMoveTarget - Static method for backward compat
   */

  _package.setMoveTarget = function (event, elem) {
    return new ecma.lsn.Move(event, elem);
  };

  /**
   * @class Move
   *
   * @param event <Event> Initiating event (usually mousedown)
   * @param target <Element|ID> DOM Element to move
   *
   * Elements which are to be move targets should not have a margin set.
   */

  var CBase = ecma.lsn.ui.Base;

  _package.Move = function CMove (event, elem) {
    CBase.apply(this);
    this.elem = ecma.dom.getElement(elem);
    this.listenOn = ecma.dom.browser.isIE ? ecma.document : ecma.window;
    if (!this.elem) return;
    this.mmEvent = new ecma.dom.EventListener(this.listenOn, 'mousemove', this.onMouseMove, this);
    this.muEvent = new ecma.dom.EventListener(this.listenOn, 'mouseup', this.onMouseUp, this);
    var vp = ecma.dom.getViewportPosition();
    ecma.dom.makePositioned(elem);
    var pointer = ecma.dom.getEventPointer(event);
    this.min_x    = vp['left'];
    this.min_y    = vp['top'];
    this.abs_x    = ecma.dom.getLeft(this.elem);
    this.abs_y    = ecma.dom.getTop(this.elem);
    this.orig_x   = ecma.util.asInt(ecma.dom.getStyle(this.elem, 'left'));
    this.orig_y   = ecma.util.asInt(ecma.dom.getStyle(this.elem, 'top'));
    this.orig_z   = ecma.dom.getStyle(this.elem, 'z-index');
    // Current position
    this.curr_x   = this.orig_x;
    this.curr_y   = this.orig_y;
    this.curr_z   = this.zIndexAlloc();
    // Mouse position
    this.orig_mx  = pointer.x;
    this.orig_my  = pointer.y;
    // Constrain movement to the visible canvas
    this.max_x = vp['left'] + vp['width'] - ecma.dom.getWidth(this.elem);
    this.max_y = vp['top'] + vp['height'] - ecma.dom.getHeight(this.elem);
    // Position element
    ecma.dom.setStyle(this.elem, 'left', this.orig_x.toString(10) + 'px');
    ecma.dom.setStyle(this.elem, 'top', this.orig_y.toString(10) + 'px');
    ecma.dom.setStyle(this.elem, 'z-index', this.curr_z);
    // Stop event after all succeeds
    ecma.dom.stopEvent(event);
    this.executeClassAction('onMoveStart');
  };

  var PMove = _package.Move.prototype = ecma.lang.createPrototype(
    CBase
  );

  PMove.onMouseUp = function (event) {
    this.mmEvent.remove();
    this.muEvent.remove();
    this.curr_z = this.orig_z;
    ecma.dom.setStyle(this.elem, 'z-index', this.curr_z);
    ecma.dom.stopEvent(event);
    this.executeClassAction('onMoveEnd');
  };

  PMove.onMouseMove = function(event) {
    // Calculate
    var pointer = ecma.dom.getEventPointer(event);
    var delta_x = pointer.x - this.orig_mx;
    var delta_y = pointer.y - this.orig_my;
    this.curr_x = this.orig_x + delta_x;
    this.curr_y = this.orig_y + delta_y;
    // Constrain
    if (this.abs_x + delta_x >= this.max_x) this.curr_x = this.max_x;
    if (this.abs_y + delta_y >= this.max_y) this.curr_y = this.max_y;
    if (this.abs_x + delta_x <  this.min_x) this.curr_x = this.min_x;
    if (this.abs_y + delta_y <  this.min_y) this.curr_y = this.min_y;
    // Apply new position
    if (this.curr_x != null) {
      ecma.dom.setStyle(this.elem, 'left', (this.curr_x).toString(10) + 'px');
    }
    if (this.curr_y != null) {
      ecma.dom.setStyle(this.elem, 'top', (this.curr_y).toString(10) + 'px');
    }
    ecma.dom.stopEvent(event);
    this.executeClassAction('onMove');
  };

  PMove.hasMoved = function () {
    return this.orig_x == this.curr_x
        && this.orig_y == this.curr_y;
  };

});
