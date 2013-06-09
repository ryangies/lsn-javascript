/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var _globalMask = undefined;

  var _defaultStyles = {
    'opacity': .75,
    'background-color': 'white'
  };

  var _requiredStyles = {
    'position':'absolute',
    'margin':0, 'padding':0, 'border':0, 'overflow':'hidden',
    'top':0, 'left':0, 'width':0, 'height':0
  };

  /**
   * @class Mask
   * A layer mask over the viewport.
   *  var mask = new ecma.lsn.Mask();
   *  var mask = new ecma.lsn.Mask(optStyle);
   * The C<optStyle> object is passed to L<ecma.dom.createElement> as the style
   * for the DIV which is the mask.  The actual DIV element which is the mask 
   * is created here as the public member C<ui>.  You may access it after function
   * is complete:
   *  var mask = new ecma.lsn.Mask();
   *  var div = mask.ui;
   */
  this.Mask = function (optStyle) {
    this.showCount = 0;
    this.style = ecma.util.overlay({}, _defaultStyles, optStyle, _requiredStyles);
    this.ui = ecma.dom.createElement('div');
    if (ecma.dom.browser.isIE) {
      //Fix for ie5/6, mask unable to hide select boxes. The src attribute must 
      //be set or IE will complain about both secure and non-secure times being 
      //on the page.
      this.ui.appendChild(ecma.dom.createElement('iframe', {
        'width': '0',
        'height': '0',
        'frameborder': '0',
        'src': 'about:blank',
        'style': {
          'width': '0',
          'height': '0',
          'visibility': 'hidden'
        }
      }));
    }
  };

  this.Mask.prototype = {

    /**
     * @function show
     * Show the mask.
     *  mask.show();
     *  mask.show(optStyle);
     * The C<optStyle> object contains styles which are applied to the mask
     * when it is shown, overriding any set in the constructor.
     */
    show: function (optStyle) {
      this.showCount++;
      if (this.showCount > 1) return;
      this.initDOM();
      this.applyStyles(optStyle);
      this.ce.appendChild(this.ui);
      this.t = ecma.dom.getTop(this.ui);
      this.l = ecma.dom.getLeft(this.ui);
      ecma.dom.setStyle(this.html, 'width', '100%');
      ecma.dom.setStyle(this.html, 'height', '100%');
      this.resize();
      this.resizeEvent = new ecma.dom.EventListener(
        window, 'resize', this.resize, this
      );
      return this;
    },

    initDOM: function () {
      var body = ecma.dom.getBody();
      this.ce = ecma.dom.browser.isIE ? body : body.parentNode || body;
      this.html = body.parentNode;
      this.canvas = new ecma.dom.Canvas();
    },

    applyStyles: function (optStyle) {
      var style = ecma.util.overlay(this.style, optStyle);
      var opacity = undefined;
      if (style) {
        for (var k in style) {
          if (k == 'opacity') {
            opacity = style[k];
            continue;
          }
          ecma.dom.setStyle(this.ui, k, style[k]);
        }
      }
      if (ecma.util.defined(opacity)) ecma.dom.setOpacity(this.ui, opacity);
    },

    getElement: function () {
      return this.ui;
    },

    /**
     * @function hide
     * Hide the mask.
     *  mask.hide();
     */
    hide: function () {
      this.showCount--;
      if (this.showCount < 0) this.showCount = 0;
      if (this.showCount) return;
      try {
        this.ce.removeChild(this.ui);
        this.resizeEvent.remove();
      } catch (ex) {
      }
      return this;
    },

    /**
     * @function resize
     *
     * Resize the mask to match cover the viewport.  This function is called
     * internally when needed, but available if you need it.
     *
     *  mask.resize();
     *
     * This function does not work well when the window becomes a smaller size.
     * Reason being, this mask itself may be preventing the pageX and pageY
     * dimensions from returning the true size of the page.
     */

    resize: function () {
      var w = this.canvas.getWidth() - this.l;
      var h = this.canvas.getHeight() - this.t;
      ecma.dom.setStyle(this.ui, 'width', w + "px");
      ecma.dom.setStyle(this.ui, 'height', h + "px");
    }

  };

  /** @namespace lsn */

  /**
   * @function showMask
   * Convenience method for displaying a generic page mask.
   *  ecma.lsn.showMask();
   *  ecma.lsn.showMask(optStyle);
   * See L<ecma.lsn.Mask.show> for more information.
   */

  this.showMask = function (style) {
    if (!_globalMask) _globalMask = new ecma.lsn.Mask();
    return _globalMask.show(style);
  };

  /**
   * @function hideMask
   * Convenience method for hiding the generic page mask.
   *  ecma.lsn.hideMask();
   */

  this.hideMask = function () {
    if (_globalMask) return _globalMask.hide();
  };

});
