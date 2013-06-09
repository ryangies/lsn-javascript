/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var _package = this;

  /*
  var reEventSelector = new RegExp('(.*):([a-z]+)$', 'i');
  var parts = reEventSelector.exec(selectors[i]);
  if (!parts) throw new Error ('Unrecognized selector:event specified');
  */

  /**
   * @function addElementListener
   */

  _package.elementListeners = [];

  this.addElementListener = function (selectors, events, callback) {
    if (!selectors) throw new TypeError('Missing selectors');
    if (!events) throw new TypeError('Missing events');
    if (!callback) throw new TypeError('Missing callback');
    if (!ecma.util.isArray(selectors)) selectors = [selectors];
    if (!ecma.util.isArray(events)) events = [events];
    var result = [];
    for (var i = 0; i < selectors.length; i++) {
      var selector = selectors[i];
      var elements = ecma.dom.selectElements(selector, ecma.document);
      for (var j = 0, elem; elem = elements[j]; j++) {
        for (var k = 0, eventName; eventName = events[k]; k++) {
          result.push(new ecma.dom.ElementListener(selector, elem, eventName, callback));
        }
      }
    }
    // Stash listener args for runtime elements
    _package.elementListeners.push([selectors, events, callback]);
    return result;
  };

  /**
   * @structure adaptors
   */

  this.adaptors = {};

  /** @namespace dom */

  /**
   * @function addAdaptor
   */

  this.addAdaptor = function (tags, adaptor) {
    if (!tags) throw new TypeError();
    if (!ecma.util.isArray(tags)) tags = [tags];
    var dispatcher = ecma.dom.dispatcher;
    for (var i = 0; i < tags.length; i++) {
      var tagName = tags[i];
      var pool = ecma.dom.adaptors[tagName];
      if (!pool) {
        pool = ecma.dom.adaptors[tagName] = new ecma.data.Pool();
      }
      adaptor.addActionListener('*', dispatcher.dispatchAction, dispatcher);
      pool.add(adaptor);
    }
  };

  /**
   * @function attachAdaptors
   */

  this.attachAdaptors = function (rootElement) {
    for (var selector in ecma.dom.adaptors) {
      var pool = ecma.dom.adaptors[selector];
      var elements = ecma.dom.selectElements(selector, rootElement);
      if (rootElement.tagName == selector.toUpperCase()) {
        // Special case only handles tag-name selector
        elements.unshift(rootElement);
      }
      for (var j = 0, elem; elem = elements[j]; j++) {
        pool.forEach(function (adaptor) {
          try {
            adaptor.attach(elem);
          } catch (ex) {
            ///ecma.console.log(ex);
          }
        });
      }
    }
  };

  /**
   * @function createElement
   *
   * This overrides js.dom.createElement as defined in dom/dom.js, simply
   * attaching any matching adpators.
   *
   * When creating elements dynamically, adaptors which use selectors won't
   * really work because the element has not yet been added to the dom which
   * provides the working selector context. In this case:
   *
   *  1) Add the adaptor using its tagName
   *  2) The adaptor should ignore unwanted elements in its C<attach> function
   */

  var _createElementImpl = this.createElement;

  this.createElement = function () {
    var elem = _createElementImpl.apply(this, arguments);
    ecma.dom.attachAdaptors(elem);
    return elem;
  };

});

/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  // Use `window` load even such that candidate elements (and adaptors) can be 
  // added to the DOM on `document` load.
  new ecma.dom.EventListener(ecma.window, 'load', function (event) {
    ecma.dom.attachAdaptors(ecma.dom.getBody());
  });

});
