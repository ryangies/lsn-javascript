/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  /**
   * @class DragHandle
   * Make an element a handle for dragging.
   *
   *  var dh = new ecma.lsn.DragHandle(elem);
   *  var dh = new ecma.lsn.DragHandle(elem, opts);
   *
   * The C<opt> object may contain:
   *
   *  opts.threshold      Pixels of dragging required to start
   *  opts.onMouseDown    Callback
   *  opts.onMouseUp      Callback
   *  opts.onMouseMove    Callback
   *
   * The callback functions are passed two arguments, the C<event> and the 
   * C<this> pointer.  For example:
   *
   *  new js.lsn.DragHandle('elem-id', {
   *    'onMouseMove': function (event, dh) {
   *      js.console.log(dh.delta_x, dh.delta_y);
   *      event.stop();
   *    }
   *  };
   *
   * @member orig_mx
   * Original mouse X position
   * @member orig_my
   * Original mouse Y position
   * @member delta_x
   * Difference between original and current mouse X position
   * @member delta_y
   * Difference between original and current mouse Y position
   *
   */
  this.DragHandle = function(elem, opts) {
    this.opts = {
      'threshold': 0,
      'onMouseDown': function (event, dh) { event.stop() },
      'onMouseUp': function (event, dh) { event.stop() },
      'onMouseMove': function (event, dh) { event.stop() }
    };
    ecma.util.overlay(this.opts, opts);
    this.elem = ecma.dom.getElement(elem);
    if (!this.elem) return;
    this.listenOn = ecma.dom.browser.isIE ? ecma.document : ecma.window;
    ecma.dom.addEventListener(this.elem, 'mousedown', this.onMouseDown, this);
    this.reset();
    this.mmEvent = null;
    this.muEvent = null;
  };

  this.DragHandle.prototype = {

    /**
     * @function reset
     * Reset the internal tracking data.
     *  dh.reset();
     */
    reset: function () {
      this.orig_mx = 0;
      this.orig_my = 0;
      this.delta_x = 0;
      this.delta_y = 0;
      this.dragging = false;
    },

    onMouseDown: function (event) {
      this.reset();
      var pointer = ecma.dom.getEventPointer(event);
      this.orig_mx = pointer.x;
      this.orig_my = pointer.y;
      this.mmEvent = new ecma.dom.EventListener(this.listenOn, 'mousemove', this.onMouseMove, this);
      this.muEvent = new ecma.dom.EventListener(this.listenOn, 'mouseup', this.onMouseUp, this);
      ecma.lang.callback(this.opts.onMouseDown, this, [event, this]);
    },

    onMouseUp: function (event) {
      this.mmEvent.remove();
      this.muEvent.remove();
      this.dragging = false;
      ecma.lang.callback(this.opts.onMouseUp, this, [event, this]);
    },

    onMouseMove: function(event) {
      var pointer = ecma.dom.getEventPointer(event);
      this.delta_x = pointer.x - this.orig_mx;
      this.delta_y = pointer.y - this.orig_my;
      if (!this.dragging
          && Math.abs(this.delta_x) < this.opts.threshold
          && Math.abs(this.delta_y) < this.opts.threshold) {
        return
      }
      this.dragging = true;
      ecma.lang.callback(this.opts.onMouseMove, this, [event, this]);
    }

  };

});
