/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var _defaultBackground = '#f2f2f2';
  var _defaultOpacity = .75;

  var COVER_CANVAS = 0;
  var COVER_ELEMENT = 1;

  var CBase = ecma.lsn.ui.Base;

  /**
   * @class Mask - An element which covers the entire page.
   *
   = Action Interface
   *
   * The below actions also invoke derived class methods of the same name and
   * are synchronous.
   *
   *    onMaskLoad      When .show() is called the first time
   *    onMaskShow      When .show() is invoked (and before anything happens)
   *    onMaskAttach    After the elements have been added to the document
   *    onMaskReady     After the mask appears (asynchronous callbacks)
   *    onMaskHide      When .hide() is invoked (and before anything happens)
   *    onMaskDetach    After the elements have been removed from the document
   *
   *    Example:
   *
   *      var mask = new ecma.lsn.ui.Mask();
   *
   *      mask.show();    // onMaskLoad (iff this is the first time)
   *                      // onMaskShow
   *                      // onMaskAttach
   *                      // onMaskReady
   *
   *      mask.hide();    // onMaskHide
   *                      // onMaskDetach
   *
   */

  this.Mask = function (seedElement) {
    CBase.apply(this);
    this.hasLoaded = false;
    this.createUI();
    this.fxShow = new ecma.fx.effects.Opacify(this.getRoot(), 0, _defaultOpacity, 100);
    this.fxHide = new ecma.fx.effects.Opacify(this.getRoot(), _defaultOpacity, 0, 100);
    this.seedElement = seedElement;
  };

  var _proto = this.Mask.prototype = ecma.lang.createPrototype(
    CBase
  );

  /**
   * getRoot - Return the root element (DIV) of this mask.
   */

  _proto.getRoot = function () {
    return this.uiRoot;
  };

  _proto.setOpacity = function (opacity) {
    this.fxShow.end = opacity;
    this.fxHide.begin = opacity;
    return opacity;
  };

  _proto.setDuration = function (ms) {
    this.fxShow.setDuration(ms);
    this.fxHide.setDuration(ms);
    return ms;
  };

  _proto.setBackground = function (cssValue) {
    ecma.dom.setStyle(this.uiRoot, 'background', cssValue);
    return cssValue;
  };

  _proto.load = function () {
    if (this.hasLoaded) return;
    this.canvas = new ecma.dom.Canvas();
    this.executeClassAction('onMaskLoad');
    this.hasLoaded = true;
  }

  _proto.setUIParent = function (parentElem) {
    var body = ecma.dom.getBody();
    this.html = body.parentNode;
    if (parentElem) {
      this.uiParent = parentElem;
      this.maskMethod = COVER_ELEMENT;
    } else {
      this.uiParent = ecma.dom.browser.isIE ? body : this.html || body;
      this.maskMethod = COVER_CANVAS;
    }
  };

  _proto.getDimensions = function () {
    var result = {'width':0, 'height':0};
    switch (this.maskMethod) {
      case COVER_ELEMENT:
        result.width = ecma.dom.getWidth(this.uiParent);
        result.height = ecma.dom.getHeight(this.uiParent);
        break;
      case COVER_CANVAS:
      default:
        result.width = this.canvas.getWidth();
        result.height = this.canvas.getHeight();
    }
    return result;
  };

  /**
   * show - Show the mask.
   */

  _proto.show = function () {
    this.load();
    this.executeClassAction('onMaskShow');
    this.attach();
    this.appear([function () {
      this.dispatchClassAction('onMaskReady');
    }, this]);
  };

  /**
   * hide - Hide the mask.
   */

  _proto.hide = function () {
    this.executeClassAction('onMaskHide');
    this.disappear([function () {
      this.detach();
    }, this]);
  };

  /**
   * attach - Attach the UI to the DOM.
   */

  _proto.attach = function () {
    if (!this.uiParent) this.setUIParent(this.seedElement);
    switch (this.maskMethod) {
      case COVER_ELEMENT:
        break;
      case COVER_CANVAS:
      default:
        ecma.dom.setStyle(this.html, 'width', '100%');
        ecma.dom.setStyle(this.html, 'height', '100%');
    }
    ecma.dom.setStyle(this.uiRoot, 'z-index', this.zIndexAlloc());
    this.resizeEvent = new ecma.dom.EventListener(ecma.window, 'resize', this.resize, this);
    this.resize();
    ecma.dom.appendChild(this.uiParent, this.uiRoot);
    this.executeClassAction('onMaskAttach');
  };

  _proto.resize = function () {
    var dims = this.getDimensions();
    ecma.dom.setStyle(this.uiRoot, 'width', dims.width + "px");
    ecma.dom.setStyle(this.uiRoot, 'height', dims.height + "px");
  };

  /*
   * detach - Detach the UI from the DOM.
   */

  _proto.detach = function () {
    try {
      ecma.dom.removeElement(this.uiRoot);
      this.resizeEvent.remove();
    } catch (ex) {
    }
    this.zIndexFree();
    ecma.dom.setStyle(this.uiRoot, 'z-index', '-1');
    this.executeClassAction('onMaskDetach');
  };

  _proto.appear = function (cb) {
    this.fxShow.start(cb);
  };

  _proto.disappear = function (cb) {
    this.fxHide.start(cb);
  };

  /**
   * createUI - Create the UI elements.
   */

  _proto.createUI = function () {
    this.uiRoot = ecma.dom.createElement('div', {
      'style': {
        'background': _defaultBackground,
        'position': 'absolute',
        'overflow': 'hidden',
        'z-index': '-1',
        'margin': 0,
        'padding': 0,
        'border': 0,
        'top': 0,
        'left': 0,
        'width': 0,
        'height': 0
      }
    });
    this.fixupUI();
    ecma.dom.setOpacity(this.uiRoot, 0);
    return this.uiRoot;
  };

  if (ecma.dom.browser.isIE) {

    /**
     * fixupUI - Conditional elements based on browser.
     *
     * Fix for ie5/6, mask unable to hide select boxes. The src attribute must 
     * be set or IE will complain about both secure and non-secure times being 
     * on the page.
     */

    _proto.fixupUI = function () {
      this.uiRoot.appendChild(ecma.dom.createElement('iframe', {
        'width': 0,
        'height': 0,
        'frameborder': 0,
        'src': 'about:blank',
        'style': {
          'width': 0,
          'height': 0,
          'visibility': 'hidden'
        }
      }));
    };

  } else {

    _proto.fixupUI = function () {
    };

  }

});
