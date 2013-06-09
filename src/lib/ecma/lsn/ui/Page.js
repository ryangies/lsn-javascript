/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var LOADING = 0;
  var LOADED = 1;
  var UNLOADING = 2;
  var UNLOADED = 3;

  /**
   * @class Page
   * Provides common events and methods for javascript web pages.
   *
   *  // Before Document onLoad
   *  var p = new Page();
   *
   * Action Listeners
   *
   *  p.addActionListener(name, cb);
   *
   *  name    Action name L<1>
   *  cb      Callback L<2>
   *
   * N<1> Actions
   *
   *  Name          Called When
   *  ------------- ------------------------------------------------------------
   *  onPageLoad        DOM load   
   *  onPageResize      Window resize
   *  onPageScroll      Window scroll
   *  onPageUnload      Window unload
   *
   * N<2> Callback API
   *
   *  function (action, event);
   */

  var CDispatcher = ecma.action.ActionDispatcher;

  var _proto = ecma.lang.createPrototype(CDispatcher);

  this.Page = function () {
    CDispatcher.call(this);
    this.pgState = LOADING;
    this.pgRefreshRate = 250; // milliseconds
    this.pgBuffer = {}; // buffer events
    this.pgCanvas = {width: 0, height: 0, delta: {width: 0, height: 0}};
    this.pgViewport = {width: 0, height: 0, left: 0, top: 0, delta: {width: 0, 
      height: 0, top: 0, left: 0}};
    this.pgStyleSheet = null; // not available until dom loaded
    ecma.dom.addEventListener(ecma.document, 'load', this.onLoadEvent, this);
    ecma.dom.addEventListener(ecma.window, 'resize', this.onResizeEvent, this);
    ecma.dom.addEventListener(ecma.window, 'scroll', this.onScrollEvent, this);
    ecma.dom.addEventListener(ecma.window, 'beforeunload', this.onBeforeUnloadEvent, this);
    ecma.dom.addEventListener(ecma.window, 'unload', this.onUnloadEvent, this);
  };

  this.Page.prototype = _proto;

  _proto.getViewport = function () {
    return this.pgViewport;
  };

  _proto.getCanvas = function () {
    return this.pgCanvas;
  };

  _proto.getStyleSheet = function () {
    return this.pgStyleSheet;
  };

  _proto.hasPageLoaded = function () {
    return ecma.dom.content.hasLoaded;
  };

  _proto.addActionListener = function (name, listener, scope, args) {
    var listener = CDispatcher.prototype.addActionListener.apply(this, arguments);
    if (listener.name == this.normalizeActionName('onPageLoad')) {
      try {
        listener.invoke(null); // onLoad event object no longer available
      } catch (ex) {
        ///js.console.log(ex);
      }
    }
    return listener;
  };

  /** Class derivation hooks */

  _proto.onPageLoad = function (event) {
  };

  _proto.onPageResize = function (event) {
  };

  _proto.onPageScroll = function (event) {
  };

  _proto.onPageBeforeUnload = function (event) {
  };

  _proto.onPageUnload = function (event) {
  };

  /** DOM Event handlers */

  _proto.onLoadEvent = function (event) {
    this.pgState = LOADED;
    this.pgStyleSheet = new ecma.dom.StyleSheet();
    this.doAction(event, 'onPageLoad');
  };

  _proto.onResizeEvent = function (event) {
    this.bufferAction(event, 'onPageResize');
  };

  _proto.onScrollEvent = function (event) {
    this.bufferAction(event, 'onPageScroll');
  };

  _proto.onBeforeUnloadEvent = function (event) {
    this.pgState = UNLOADING;
    this.doAction(event, 'onPageBeforeUnload');
  };

  _proto.onUnloadEvent = function (event) {
    this.pgState = UNLOADED;
    this.doAction(event, 'onPageUnload');
  };

  /** Action handlers **/

  _proto.bufferAction = function (event, name) {
    if (this.pgBuffer[name]) return;
    this.pgBuffer[name] = ecma.dom.setTimeout(this.doBufferedAction,
      this.pgRefreshRate, this, [event, name]);
  };

  _proto.doBufferedAction = function (event, name) {
    delete this.pgBuffer[name];
    this.doAction(event, name);
  };

  _proto.doAction = function (event, name) {
    this.pgUpdate(name);
    var func = this[name];
    if (func) {
      func.call(this, event);
    } else {
      throw new Error('No class method defined for action: ' + name);
    }
    this.executeAction(name, event);
  };

  /** Internal methods */

  /**
   * @internal pgUpdate
   * Sets member values from window size and position
   * The name is passed for using it may improve speed by limiting what 
   * calculations are done.
   */

  _proto.pgUpdate = function (name) {
    var pos = ecma.dom.canvas.getPosition();
    var vp = this.pgViewport;
    var c = this.pgCanvas;
    // Size
    c.delta.width = pos.width - c.width;
    c.delta.height = pos.height - c.height;
    c.width = pos.width;
    c.height = pos.height;
    vp.delta.width = pos.windowX - vp.width;
    vp.delta.height = pos.windowY - vp.height;
    vp.width = pos.windowX;
    vp.height = pos.windowY;
    // Position
    vp.delta.left = pos.scrollX - vp.left;
    vp.delta.top = pos.scrollY - vp.top;
    vp.top = pos.scrollY;
    vp.left = pos.scrollX;
  };

});
