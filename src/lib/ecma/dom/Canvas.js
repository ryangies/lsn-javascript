/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class Canvas
   */

  this.Canvas = function () {
    this.doc = ecma.document.documentElement || ecma.document;
    this.body = ecma.dom.getBody();
    this.root = ecma.document.rootElement || this.body.parentNode;
  };

  var _proto = this.Canvas.prototype = ecma.lang.createPrototype();

  _proto.getPosition = function () {
    return {
      'left': this.getLeft(),
      'top': this.getTop(),
      'width': this.getWidth(),
      'height': this.getHeight()
    };
  };

  // When the page overflows in only one direction, the opposing scrollbar
  // must be accounted for.
  // HTML width/height must be 100% (which is done in the this.show())
  // Minimum h/w is that of the window
  // The 1px bug in IE in BackCompat mode is not accounted for

  _proto.getWidth = function () {
    var winX = this.windowX();
    var pgX = this.pageX();
    var w = winX < pgX ? pgX : winX;
    // Account for vertical scrollbar
    var sbX = 0;
    var rootX = ecma.dom.getWidth(this.root);
    if (rootX == pgX) {
      if (ecma.document.compatMode == 'BackCompat') {
        sbX = Math.abs(winX - rootX);
      } else if (ecma.document.compatMode == 'CSS1Compat') {
        sbX = ecma.dom.browser.isIE ? 0 : Math.abs(winX - rootX);
      }
    }
//  ecma.console.log('sbX='+sbX);
    return w - sbX;
  };

  _proto.getHeight = function () {
    // Account for horizontal scrollbar
    var winY = this.windowY();
    var pgY = this.pageY();
    var h = winY < pgY ? pgY : winY;
    var sbY = 0;
    var rootY = ecma.dom.getHeight(this.root);
    if (rootY == pgY) {
      if (ecma.document.compatMode == 'BackCompat') {
        sbY = Math.abs(winY - rootY);
      } else if (ecma.document.compatMode == 'CSS1Compat') {
        sbY = ecma.dom.browser.isIE ? 0 : Math.abs(winY - rootY);
      }
    }
//  ecma.console.log('sbY='+sbY);
    return h - sbY;
  };

  _proto.getRawWidth = function () {
    return this.getDimension('Width');
  };

  _proto.getRawHeight = function () {
    return this.getDimension('Height');
  };

  _proto.getDimension = function  (name) {
    return Math.max(
      this.doc["client" + name],
      this.body["scroll" + name], this.doc["scroll" + name],
      this.body["offset" + name], this.doc["offset" + name]
    );
  };

  /** @function windowX */
  _proto.windowX = function() {
    return ecma.window.innerWidth
      || this.doc.clientWidth
      || this.body.clientWidth
      || this.doc.offsetWidth;
  };

  /** @function windowY */
  _proto.windowY = function() {
    return ecma.window.innerHeight
      || this.doc.clientHeight
      || this.body.clientHeight
      || this.doc.offsetHeight;
  };

  /** @function getLeft */
  /** @function scrollX */
  _proto.getLeft = 
  _proto.scrollX = function() {
    return this.doc.scrollLeft || ecma.window.pageXOffset || this.body.scrollLeft;
  };

  /** @function getTop */
  /** @function scrollY */
  _proto.getTop = 
  _proto.scrollY = function() {
    return this.doc.scrollTop || ecma.window.pageYOffset || this.body.scrollTop;
  };

  /** @function pageX */
  _proto.pageX = function() {
    return Math.max(
      this.doc.scrollWidth,
      this.body.scrollWidth,
      this.body.offsetWidth
    );
  };

  /** @function pageY */
  _proto.pageY = function() {
    return Math.max(
      this.doc.scrollHeight,
      this.body.scrollHeight,
      this.body.offsetHeight
    );
  };

});

/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var _canvas = undefined;

  /**
   * @function getCanvasPosition
   */

  this.getCanvasPosition = function () {
    if (!_canvas) _canvas = new ecma.dom.Canvas();
    return _canvas.getPosition();
  };

});
