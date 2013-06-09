/**
 * @namespace dom
 */

ECMAScript.Extend('dom', function (ecma) {

  /**
   * _fork
   *
   * Many of these functions take an element as the first argument and do
   * not return a value. This method `_fork` simply wraps such a function so 
   * that it can be passed an array of elements as the first argument.
   *
   * @return Depends on `arguments[0]`. If the caller passed in an array, then
   * an array is returned, with each result as a corresponding member.
   *
   * Is this a candidate method for ecma.util?
   */

  function _fork (func, scope) {
    return function () {
      var result = [];
      var args = ecma.util.args(arguments);
      var wantarray = ecma.util.isArray(args[0]);
      var elems = wantarray ? args.shift() : [args.shift()];
      for (var i = 0; i < elems.length; i++) {
        result.push(func.apply(scope || this, [elems[i]].concat(args)));
      }
      return wantarray ? result : result[0];
    };
  }

  /**
   * @structure browser
   * Browser types.
   * Logic derived from Prototype (L<http://www.prototypejs.org>)
   * Depricated, use L<ecma.platform>.
   */

  this.browser = {

    /** @member isIE */
    isIE:
      !!(ecma.window.attachEvent
      && ecma.window.navigator.userAgent.indexOf('Opera') === -1),

    /** @member isOpera */
    isOpera:
      ecma.window.navigator.userAgent.indexOf('Opera') > -1,

    /** @member isWebKit */
    isWebKit:
      ecma.window.navigator.userAgent.indexOf('AppleWebKit/') > -1,

    /** @member isGecko */
    isGecko:
      ecma.window.navigator.userAgent.indexOf('Gecko') > -1
      && ecma.window.navigator.userAgent.indexOf('KHTML') === -1,

    /** @member isMobileSafari */
    isMobileSafari:
      !!ecma.window.navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  /** @namespace dom */

  /**
   * @function getEventPointer
   * Pointer x/y coordinates derived directly from Prototype
   */
  this.getEventPointer = function (event) {
    var docElement = ecma.document.documentElement,
    body = ecma.dom.getRootElement() || { scrollLeft: 0, scrollTop: 0 };
    return {
      x: event.pageX || (event.clientX +
        (docElement.scrollLeft || body.scrollLeft) -
        (docElement.clientLeft || 0)),
      y: event.pageY || (event.clientY +
        (docElement.scrollTop || body.scrollTop) -
        (docElement.clientTop || 0))
    };
  };

  /**
   * @function getEventTarget
   */

  this.getEventTarget = function (event) {
    if (!event.target && event.srcElement) return event.srcElement;
    return event.target;
  };

  /**
   * @function addEventListener
   * Add an event listener to the target element.
   *
   *  ecma.dom.addEventListener(elem, listener);
   *  ecma.dom.addEventListener(elem, listener, scope);
   *  ecma.dom.addEventListener(elem, listener, scope, args);
   *  ecma.dom.addEventListener(elem, listener, scope, args, useCapture);
   *
   # If you are passing C<scope> or C<args>, the return value is the function 
   # needed for L<ecma.dom.removeEventListener>!
   *
   * @param target      <Element>   Target element
   * @param listener    <Function>  Callback function
   * @param scope       <Object>    Callback scope L<1>
   * @param args        <Array>     Arguments (appended after event parameter) L<1>
   * @param useCapture  <Boolean>   Use capture L<2>
   *
   * N<1> This method create the intermediate anonymous function, which is returned.
   *
   * N<2> Is only used when C<Element.addEventListener> exists.
   */

  /**
   * _eventName - Normalize event name (remove leading 'on')
   * Do not lower-case, event names are case-sensitive.
   */

  function _eventName (name) {
    try {
      name = name.indexOf('on') == 0 ? name.substr(2) : name;
      return name.indexOf('DOM') == 0 ? name : name.toLowerCase();
    } catch (ex) {
      // e.g., name is not defined or not a string
    }
  }

  this.addEventListener = function (target, type, listener, scope, args, useCapture) {
    var elem = ecma.dom.getElement(target);
    if (!elem) throw new Error('No such element');
    if (!useCapture) useCapture = false;
    if (typeof(type) == 'function') throw new Error('Missing argument: event type');
    var name = _eventName(type);
    var func = scope || args
      ? function () {
          var argz = ecma.util.args(arguments);
          return listener.apply(scope || elem, argz.concat(args));
        }
      : listener;
    if (target === ecma.document && name == 'load') {
      if (ecma.dom.content.hasLoaded) {
        ecma.lang.callback(func);
      } else {
        // Need to unwrap the first `action` argument
        func = function (action, event) {
          return listener.apply(scope || elem, [event].concat(args));
        };
        ecma.dom.content.addActionListener('load', func);
      }
//  TODO After incubation period of history.js is over, include it in the
//  build file and uncomment this condition.
//  } else if (target === ecma.window && name == 'statechange') {
//    ecma.platform.history.Adapter.bind(ecma.window, name, func);
    } else if (elem.addEventListener) {
      elem.addEventListener(name, func, useCapture);
    } else if (elem.attachEvent) {
      elem.attachEvent('on'+name, func);
    } else {
      throw new Error('Cannot add event listener');
    }
    return func;
  };

  /**
   * @function removeEventListener
   */

  this.removeEventListener = function (target, type, listener, scope, useCapture) {
    var elem = ecma.dom.getElement(target);
    if (!elem) throw new Error('No such element');
    if (!useCapture) useCapture = false;
    var name = _eventName(type);
    if (elem.removeEventListener) {
      elem.removeEventListener(name, listener, useCapture);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + name, listener);
    } else {
      throw new Error('Cannot remove event listener');
    }
  }

  /**
   * @function stopEvent
   * Stops the given event from propigating and bubbling.
   *  ecma.dom.stopEvent(event);
   * Where:
   *  event   <Event>       The event to stop
   * Additionally, C<event.stopped> is set to C<true>.
   */

  this.stopEvent = function (event) {
    try {
      event.stopped = true; // for this and other libraries
      event.preventDefault();
      event.stopPropagation();
    } catch (ex) {
      if (event) {
        // IE 8 and earlier
        event.cancelBubble = true;
        event.returnValue = false;
      }
    }
  };

  /**
   * @function setTimeout
   * Delay execution of a callback function.
   *  ecma.dom.setTimeout(func, delay);
   *  ecma.dom.setTimeout(func, delay, scope);
   *  ecma.dom.setTimeout(func, delay, scope, args);
   * Where:
   *  func <Function> to call back
   *  delay <Number> in milliseconds
   *  scope <Object> for C<func>
   *  args <Array> passed to C<func>
   *  excb <Function|Array> Exception handler (optional) L<1>
   *
   * Supresses arguments passed by window.setTimeout, such as the number of 
   * seconds late in FF.
   *
   * N<1> If a C<excb> function is provided it is passed any exception which
   * may be thrown while applying the callback.  The C<excb> function is
   * called with the same scope (if provided) as the callback, i.e.,
   *
   *  excb.call(scope, ex);
   */

  this.setTimeout = function (func, delay, scope, args, excb) {
    if (typeof(func) != 'function') throw new Error('Invalid argument: func');
    var cb = excb
      ? function () {
          try {
            func.apply(scope || this, args || []);
          } catch (ex) {
            ecma.lang.callback(excb, scope, [ex]);
          }
        }
      : function () {
          func.apply(scope || this, args || []);
        };
    return ecma.window.setTimeout(cb, delay);
  };

  /**
   * @function clearTimeout
   */

  this.clearTimeout = function (id) {
    return ecma.window.clearTimeout(id);
  };

  /**
   * @function setInterval
   * Repeat execution of a callback function at a specific interval.
   *  @param func to call back
   *  @param delay in milliseconds
   *  @param scope for <func>
   *  @param args passed to <func>
   * Supresses arguments passed by window.setInterval, such as the number of 
   * seconds late in FF.
   */

  this.setInterval = function (func, interval, scope, args) {
    var cb = function () {
      func.apply(scope || this, args || []);
    };
    return ecma.window.setInterval(cb, interval);
  };

  /**
   * @function clearInterval
   */

  this.clearInterval = function (id) {
    return ecma.window.clearInterval(id);
  };

  /**
   * @function waitUntil
   * Calls a function after a condition is met.
   *
   *  ecma.dom.waitUntil(func, cond);
   *  ecma.dom.waitUntil(func, cond, delay);
   *  ecma.dom.waitUntil(func, cond, delay, scope);
   *  ecma.dom.waitUntil(func, cond, delay, scope, args);
   *
   * Where
   *
   *  func      <Function>  Function to apply after
   *  cond      <Function>  Condition to be met
   *  delay     <Number>    Milliseconds to delay before checking (default=10)
   *  scope     <Object>    Applied to func and cond functions
   *  args      <Array>     Passed to func and cond functions
   *
   * The time between calls doubles (decays) each time the condition function 
   * returns false.  For example, when C<delay> is 10 (the default),
   * conditional checks will occur:
   *  1st check:  10 ms after L<ecma.dom.waitUntil> is called
   *  2nd check:  20 ms after the 1st check
   *  3rd check:  40 ms after the 2nd check
   *  4th check:  80 ms after the 3rd check
   *  5th check: 160 ms after the 3rd check
   *
   * TODO: Allow the C<delay> parameter to specify the decay value as its
   * decimal portion.  For instance, 10.2 would indicate a delay of 10 with a
   * decay of 2.
   *
   * TODO: Provide a mechanism for cancelation.  For example, if the delay is
   * 1000, abort.  Maybe another part of the C<delay> paramter, as in
   * "10.2/1000" means delay=10, decay=2, and timeout=1000...
   */

  this.waitUntil = function (func, cond, delay, scope, args) {
    if (!ecma.util.defined(delay)) delay = 10;
    var decay = 2;
    var cb = function () {
      if (cond.apply(scope || this, args || [])) {
        func.apply(scope || this, args || []);
        return true;
      }
      return false;
    }
    if (cb()) return;
    var waitFunc;
    waitFunc = function () {
      if (cb()) return;
      delay *= decay;
      ecma.dom.setTimeout(waitFunc, delay, scope, args);
    };
    ecma.dom.setTimeout(waitFunc, delay, scope, args);
  };

  /* ======================================================================== */

  /**
   * @function getRootElement
   * Get the document's root element
   */

  this.getRootElement = function () {
    return ecma.document.rootElement
      || ecma.dom.getBody()             // X?HTML
      || ecma.document.documentElement  // XML, SVG
      || ecma.document.lastChild
      || ecma.document;
  };

  /**
   * @function getHead
   * Get our document's head
   */

  this.getHead = function () {
    var heads = ecma.document.getElementsByTagName('head');
    return heads && heads.length > 0 ? heads[0] : ecma.dom.getRootElement();
  };

  /**
   * @function getBody
   * Get our document's body
   */

  this.getBody = function () {
    var bodies = ecma.document.getElementsByTagName('body');
    return bodies && bodies.length > 0 ? bodies[0] : undefined;
  };

  /**
   * @function getFrame
   * Return the frame specified by id.
   *  @param id <ID>
   */

  this.getFrame = function (id) {
    if (typeof(id) == 'object') return id;
    return frames[id] || ecma.dom.getElement(id);
  };

  /**
   * @function getContentWindow
   * Returns the inner contentWindow of an IFRAME or FRAME.
   *  @param id of the FRAME or IFRAME
   */

  this.getContentWindow = function (frameid) {
    var iframe = ecma.dom.getFrame(frameid);
    if (!iframe) return;
    return iframe.contentWindow || iframe.window;
  };

  /**
   * @function getContentDocument
   * Returns the inner contentDocument of an IFRAME or FRAME.
   *  @param id of the FRAME or IFRAME
   */

  this.getContentDocument = function (frameid) {
    var iframe = ecma.dom.getFrame(frameid);
    if (!iframe) return;
    return iframe.contentWindow
      ? iframe.contentWindow.document
      : iframe.contentDocument || iframe.document;
  };

  /**
   * @function getContentJS
   * Returns the ECMAScript.Class for the specified frame.
   *  @param frame <String|Element> Id of or the frame element.
   * A new L<ECMAScript.Class> will be created if the window does not define
   * a C<js> member.
   */

  this.getContentJS = function (frameid) {
    try {
      var frame = ecma.dom.getFrame(frameid);
      var doc = ecma.dom.getContentDocument(frame);
      var win = ecma.dom.getContentWindow(frame);
      if (!ecma.http.isSameOrigin(ecma.document.location.href,
          doc.location.href)) {
        // For platforms which do not raise an exception
        return null;
      }
      return win.js || new ECMAScript.Class(win, doc);
    } catch (ex) {
      // Documents outside this domain will throw an exception when 
      // attempting to access their window and document objects.
      return null;
    }
  };

  /**
   * @function getElementsByNodeType
   * Recursively fetch elements with a specific C<nodeType>.
   *
   *  var array = ecma.dom.getElementsByNodeType(elem, type)
   *
   * For a list of nodeType values, refer to L<ecma.dom.constants>.  For
   * example, to find all comment nodes in the body of a document:
   *
   *  var body = ecma.dom.getBody();
   *  var type = ecma.dom.constants.COMMENT_NODE;
   *  var list = ecma.dom.getElementsByNodeType(body, type);
   */

  this.getElementsByNodeType = function (elem, type) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var result = [];
    _getElementsByNodeType(elem, type, result, elem);
    return result;
  };

  /**
   * @internal
   * Recursive implementation for getElementsByNodeType
   */

  function _getElementsByNodeType (elem, type, result, topElem) {
    if (!elem) return;
    if (elem.nodeType == type && elem !== topElem) {
      result.push(elem);
    }
    if (elem.childNodes) {
      for (var i = 0, node; node = elem.childNodes[i]; i++) {
        _getElementsByNodeType(node, type, result, topElem);
      }
    }
  }

  /**
   * @function getElementsByClassName
   * Get elements which have the specified class name.
   *
   *  var list = ecma.dom.getElementsByClassName(elem, className);
   *
   * Where:
   *
   *  @param elem <String|HTMLElement> Element to start searching
   *  @param className <String> Class name to search for
   */

  this.getElementsByClassName = function (elem, className) {
    elem = ecma.dom.getElement(elem);
    if (typeof(elem.getElementsByClassName) == 'function') {
      return elem.getElementsByClassName(className);
    }
    var result = [];
    _getElementsByClassName(elem, className, result);
    return result;
  };

  function _getElementsByClassName (elem, className, result) {
    if (elem.hasChildNodes()) {
      for (var i = 0, node; node = elem.childNodes[i]; i++) {
        if (ecma.dom.hasClassName(node, className)) result.push(node);
        _getElementsByClassName(node, className, result);
      }
    }
  }

  /**
   * @function getElementsByAttribute
   * Recursively fetch elements of the given attribute.
   *
   *  var nodes = js.dom.getElementsByAttribute(elem, 'href', '#')
   *
   *  @param elem <Element|ID> Parent element or id
   *  @param name <String> Attribute name
   *  @param value <String|Array> Attribute value or values
   */

  this.getElementsByAttribute = function (elem, name, value) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var result = [];
    var values = ecma.util.isArray(value) ? value : [value];
    _getElementsByAttribute(elem, name, values, result, elem);
    return result;
  };

  /**
   * @internal
   * Recursive implementation for getElementsByAttribute
   */

  function _getElementsByAttribute (elem, name, values, result, topElem) {
    if (!elem) return;
    if (elem.nodeType == ecma.dom.constants.ELEMENT_NODE && elem !== topElem) {
      var attr = ecma.dom.getAttribute(elem, name);
      if (ecma.util.grep(function (v) {return attr === v;}, values)) {
        result.push(elem);
      }
    }
    if (elem.childNodes) {
      for (var i = 0, node; node = elem.childNodes[i]; i++) {
        _getElementsByAttribute(node, name, values, result, topElem);
      }
    }
  }


  /**
   * @function getElementsByTagName
   * Recursively fetch elements of the given tag name or names.
   *
   *  var elems = js.dom.getElementsByTagName(elem, tagName);
   *  var elems = js.dom.getElementsByTagName(elem, [tagName, tagName]);
   *
   *  @param  elem      <Element|ID>    Parent element or id
   *  @param  tagName   <String|Array>  Tag name or names
   *  @return elems     <Array>         Elements which match in DOM order
   *
   * Example
   *
   *  // Clear all control values
   *  var controls = js.dom.getElementsByTagName(document.body, ['INPUT', 'TEXTAREA']);
   *  for (var i = 0, ctrl; ctrl = controls[i]; i++) {
   *    js.dom.setValue(ctrl, '');
   *  }
   */

  this.getElementsByTagName = function(elem, spec) {
    var tagNames = ecma.util.isArray(spec) ? spec : [spec];
    for (var i = 0; i < tagNames.length; i++) {
      tagNames[i] = tagNames[i].toUpperCase();
    }
    var result = [];
    elem = ecma.dom.getElement(elem);
    _getElementsByAttribute(elem, 'tagName', tagNames, result, elem);
    return result;
  };

  /**
   * @structure canvas
   * Canvas (aka window, screen, and page) dimensions and position
   */

  this.canvas = {

    /** @function getPosition */
    getPosition: function () {
      var pos = {
        windowX: ecma.dom.canvas.windowX(),
        windowY: ecma.dom.canvas.windowY(),
        scrollX: ecma.dom.canvas.scrollX(),
        scrollY: ecma.dom.canvas.scrollY(),
        pageX: ecma.dom.canvas.pageX(),
        pageY: ecma.dom.canvas.pageY()
      };
      pos.width = pos.windowX < pos.pageX ? pos.pageX : pos.windowX;
      pos.height = pos.windowY < pos.pageY ? pos.pageY : pos.windowY;
      return pos;
    },

    /** @function windowX */
    windowX: function() {
      var windowX = ecma.window.innerWidth
        || (ecma.document.documentElement && ecma.document.documentElement.clientWidth)
        || ecma.dom.getRootElement().clientWidth
        || (ecma.document.documentElement && ecma.document.documentElement.offsetWidth);
      return ecma.util.asInt(windowX);
    },

    /** @function windowY */
    windowY: function() {
      var windowY = ecma.window.innerHeight
        || (ecma.document.documentElement && ecma.document.documentElement.clientHeight)
        || ecma.dom.getRootElement().clientHeight
        || (ecma.document.documentElement && ecma.document.documentElement.offsetHeight);
      return ecma.util.asInt(windowY);
    },

    /** @function scrollX */
    scrollX: function() {
      var scrollX = (ecma.document.documentElement && ecma.document.documentElement.scrollLeft)
        || ecma.window.pageXOffset
        || ecma.dom.getRootElement().scrollLeft;
      return ecma.util.asInt(scrollX);
    },

    /** @function scrollY */
    scrollY: function() {
      var scrollY = (ecma.document.documentElement && ecma.document.documentElement.scrollTop)
        || ecma.window.pageYOffset
        || ecma.dom.getRootElement().scrollTop;
      return ecma.util.asInt(scrollY);
    },

    /** @function pageX */
    pageX: function() {
      var pageX = Math.max(
        ecma.util.asInt(ecma.document.documentElement.scrollWidth),
        ecma.util.asInt(ecma.dom.getRootElement().scrollWidth),
        ecma.util.asInt(ecma.dom.getRootElement().offsetWidth)
      )
      return ecma.util.asInt(pageX);
    },

    /** @function pageY */
    pageY: function() {
      var pageY = Math.max(
        ecma.util.asInt(ecma.document.documentElement.scrollHeight),
        ecma.util.asInt(ecma.dom.getRootElement().scrollHeight),
        ecma.util.asInt(ecma.dom.getRootElement().offsetHeight)
      )
      return ecma.util.asInt(pageY);
    }

  };

  /** @namespace dom */

  /**
   * @function getViewportPosition
   * Pixel coordinates and dimensions of the viewport
   */

  this.getViewportPosition = function () {
    var c = ecma.dom.canvas.getPosition();
    return {
      'left':   c.scrollX,
      'top':    c.scrollY,
      'width':  c.windowX,
      'height': c.windowY
    };
  };

  /* ======================================================================== */

  /**
   * @function getElement
   * Cross-browser function for referring to a document element by id.
   *  @param unk Element id, Element object, or a function (which ought return an
   * element object)
   */

  this.getElement = function (unk) {
    return  typeof(unk) == 'object'         ? unk                                     :
            unk instanceof Object           ? unk                                     :
            ecma.document.getElementById    ? ecma.document.getElementById(unk)       :
            ecma.document.all               ? ecma.document.all[unk]                  :
            ecma.document.layers            ? ecma.document.layers[unk]
                                            : false;
  };

  /**
   * @function getParentElement
   * Get a parent element by its tag name.
   *
   *  var pElem = ecma.dom.getParentElement(elem);
   *  var pElem = ecma.dom.getParentElement(elem, tagName);
   *
   * Where:
   *
   *  @param elem <String|HTMLElement> Element to start searching
   *  @param tagName <String> Tag name of the parent element (optional)
   *
   * For example:
   *
   *  <table>
   *    <tbody>
   *      <tr>
   *        <td id="e1">
   *          ...
   *        </td>
   *      </tr>
   *    </tbody>
   *  </table>
   *
   *  ecma.dom.getParentElement('e1');          // will return the TR element
   *  ecma.dom.getParentElement('e1', 'TABLE'); // will return the TABLE element
   */

  this.getParentElement = function (elem, tagName) {
    elem = ecma.dom.getElement(elem);
    while (elem && elem.parentNode) {
      if (elem.parentNode.nodeType == 1) {
        if (!tagName || elem.parentNode.tagName == tagName) {
          return elem.parentNode;
        }
      }
      elem = elem.parentNode;
    }
    return undefined;
  };

  /**
   * @function getDescendantById
   *
   * Get a child node by its id.  This method constrains the scope of elements
   * to the descendants of the given element, for times when could be many
   * elements with the same id.
   *
   *  var node = ecma.dom.getDescendantById(elem, id);
   *
   * Where:
   *
   *  @param elem <String|HTMLElement> Element to start searching
   *  @param id <String> Identifier of the target element
   *
   * For example:
   *
   *  <div id="e1">
   *    <p id="e2">...</p>
   *  </div>
   *
   *  ecma.dom.getDescendantById('e1', 'e2'); // will return the P element
   */

  this.getDescendantById = function (elem, id) {
    elem = ecma.dom.getElement(elem);
    var result = null;
    if (elem.hasChildNodes()) {
      for (var i = 0, node; node = elem.childNodes[i]; i++) {
        if (node.id == id) {
          result = node;
        } else {
          result = ecma.dom.getDescendantById(node, id);
        }
        if (result) break;
      }
    }
    return result;
  };

  /**
   * @function createElement
   * Create a document element.
   *
   *  var elem = createElement(tagName);
   *  var elem = createElement(tagName, attrs);
   *  var elem = createElement(tagName, children);
   *  var elem = createElement(tagName, attrs, children);
   *
   * Where:
   *
   *  tagName   <String>  Element tag name L<1>
   *  attrs     <Object>  Attributes for this element
   *  children  <Array>   Children of this element
   *
   * The C<arguments> are taken one at a time as a token.  If the token is a
   * string, it is intepreted as the tag name.  If it is an object (and not
   * an Array) then it is considered to be attributes.  And, if it is an
   * array, it taken to be a list of createElement arguments for child nodes.
   *
   * Create an image:
   *
   *  var elem = ecma.dom.createElement(
   #    'img', {src: 'http://www.example.com/images/example.png'}
   *  );
   *
   * Create a comment node:
   *
   *  var elem = ecma.dom.createElement(
   #    '#comment', {nodeValue: 'Example'}
   *  );
   *
   * Create a text node:
   *
   *  var elem = ecma.dom.createElement(
   #    '#text', {nodeValue: 'Example'}
   *  );
   *
   * Create a div with child elements:
   *
   *  var elem = ecma.dom.createElement(
   #    'div', [
   #      'h1', {id: 'h101'},
   #      'p', {id: 'text42', style: {'font-size':'.8em'}}
   #    ]
   *  );
   *
   * N<1> Shortcut syntax for C<tagName>
   *
   *  TODO
   *
   *  tag#id
   *  tag.class
   *  tag#id.class
   *
   *  div#myDiv.padded      tagName = div
   *                        id      = myDiv
   *                        class   = padded
   *
   */

  this.createElement = function () {
    var args = ecma.util.args(arguments);
    var tagName = args.shift();
    if (!tagName) return;
    var attrs = args.shift();
    var children = args.shift();
    if (ecma.util.isArray(attrs) || ecma.util.isa(attrs, ecma.window.NodeList)) {
      children = attrs;
      attrs = undefined;
    }
    var elem = undefined;
    if (tagName.nodeType) {
      elem = tagName;
    } else if (tagName.indexOf('#') == 0) {
      var parts = tagName.split('=', 2);
      if (parts.length == 2) {
        tagName = parts[0];
        if (!attrs) attrs = {};
        if (attrs.nodeValue) throw new Error('Multiple nodeValues');
        attrs.nodeValue = parts[1];
      }
      if (!attrs) attrs = {};
      if (tagName == '#text') {
        elem = ecma.document.createTextNode(attrs.nodeValue);
      } else if (tagName == '#comment') {
        elem = ecma.document.createComment(attrs.nodeValue);
      } else {
        throw new Error('Component not available: ' + tagName);
      }
      if (children) throw new Error('Cannot append children to a #text node');
      return elem;
    } else {
      var parts = tagName.match(/^([^#\.=]+)(#[^=\.]+)?(\.[^=]+)?(=.*)?/);
      if (!parts) throw new Error('Invalid tagName specification: ' + tagName);
      if (!attrs) attrs = {};
      tagName = parts[1];
      if (parts[2] && !attrs['id']) {
        attrs['id'] = parts[2].substr(1);
      }
      if (parts[3] && !attrs['class']) {
        attrs['class'] = parts[3].substr(1).split('.').join(' ');
      }
      if (parts[4] && !attrs['innerHTML']) {
        attrs['innerHTML'] = parts[4].substr(1);
      }
      elem = attrs && attrs.namespace && ecma.document.createElementNS
        ? ecma.document.createElementNS(attrs.namespace, tagName.toUpperCase())
        : ecma.document.createElement(tagName.toUpperCase());
    }
    if (attrs) {
      for (var k in attrs) {
        if (!k) continue;
        if (k.toLowerCase() == 'namespace') continue;
        var v = attrs[k];
        if (k.toLowerCase() == 'style' && typeof(v) == 'object') {
          for (var k2 in v) {
            var v2 = v[k2];
            ecma.dom.setStyle(elem, k2, v2);
          }
        } else {
          // attribute
          ecma.dom.setAttribute(elem, k, v);
        }
      }
    }
    if (children) {
      ecma.dom.appendChildren(elem,
        ecma.dom.createElements.apply(ecma.dom, children));
    }
    return elem;
  };

  /**
   * @function createElements
   * Create an Array of DOM elements
   *  @param tag name of first element
   *  @param attrs of first element
   *  @param children of first element
   *
   * Parameters inspected to determine what they mean.  The first parameter must
   * be a string, which specifies the tag name for this new element.  If the 
   * next parameter is an Object, which is not an Array, it specifies the 
   * attributes for this new element.  If the next param is (was) an Array
   * object, it specifies the children of this new element.
   *
   * The items of the attributes Object are passed to createElement.
   *
   * The items placed in the child Array are the arguments to recursive call to
   * this method.
   *
   */

  this.createElements = function() {
    var args = ecma.util.args(arguments);
    var elems = new Array();
    while (args && args.length > 0) {
      var attrs = null;
      var children = null;
      var childNodes = null;
      var elem = null;
      var tag = args.shift();
      if (!tag) continue;
      if (ecma.util.isArray(tag)) {
        ecma.lang.assert(elems.length, 'createElements needs something to append to');
        ecma.dom.appendChildren(elems[elems.length - 1],
          ecma.dom.createElements.apply(ecma.dom, tag)
        );
        continue; // elem does not get defined
      } else if (typeof(tag) != 'string' && tag.nodeType) {
        elem = tag;
        if (ecma.util.isArray(args[0])) {
          children = args.shift();
          ecma.dom.appendChildren(elem,
            ecma.dom.createElements.apply(ecma.dom, children)
          );
        }
      } else {
        if (ecma.util.isAssociative(args[0]) && !args[0].nodeType) {
          attrs = args.shift();
        }
        if (ecma.util.isArray(args[0])) {
          children = args.shift();
        }
        elem = ecma.dom.createElement(tag, attrs, children);
      }
      elems.push(elem);
    }
    return elems;
  };

  /**
   * @function replaceChildren
   * Remove existing children and insert new ones.
   *  @param elem <ID or Element> to act upon
   *  @param children <Array> to append
   */

  this.replaceChildren = function (elem, children) {
    var removedElements = ecma.dom.removeChildren(elem);
    ecma.dom.appendChildren(elem, children);
    return removedElements;
  };

  /**
   * @function appendChildren
   * Append children to an element.
   *
   *  @param children <Array> to append L<1>
   *  @param elem <ID or Element> to act upon L<1>
   *
   * N<1> For backward-compatability reasons these two arguments may be passed 
   * in reverse order, i.e.:
   *
   *  ecma.dom.appendChildren(elem, children)
   *
   * Passing the child array as the first argument is prefered as it matches 
   * the argument specification of the Element method C<appendChild>.
   */

  this.appendChildren = function (arg1, arg2) {
    var elem, children;
    var result = [];
    if (ecma.util.isArray(arg1)) {
      elem = arg2;
      children = arg1;
    } else {
      elem = arg1;
      children = arg2;
    }
    elem = ecma.dom.getElement(elem);
    if (!ecma.util.defined(elem)) throw new Error('[appendChildren] elem not defined');
    if (!ecma.util.defined(children)) throw new Error('[appendChildren] missing children');
    var len = children.length || 0;
    for (var i = 0; i < children.length;) {
      var child = children[i];
      if (ecma.util.defined(child)) {
        if (child instanceof Array) {
          result = result.concat(ecma.dom.appendChildren(elem, child));
        } else {
          result.push(elem.appendChild(children[i]));
        }
      }
      i++;
      if (children.length != len) {
        i -= (len - children.length);
        len = children.length;
      }
    }
    return result;
  };

  /**
   * @function appendChild
   * Append a child node.
   *  @param elem <String|DOMElement> parent element
   *  @param child <DOMElement> child element
   */

  this.appendChild = function (elem, child) {
    return ecma.dom.getElement(elem).appendChild(child);
  };

  /**
   * @function prependChild
   * Insert the element as the first child of the parent.
   *  @param elem <String|DOMElement> parent element
   *  @param child <DOMElement> child element
   */

  this.prependChild = function (elem, child) {
    var p = ecma.dom.getElement(elem)
    if (p.hasChildNodes()) {
      p.insertBefore(child, p.firstChild);
    } else {
      p.appendChild(child);
    }
  };

  /**
   * @function insertChildrenAfter
   * Insert children after an existing element
   *
   *  @param elem <ID or Element> which is to preceed the child nodes
   *  @param children <Array> children to insert
   *
   * The C<children> array may also contain arrays.
   *
   * Undefined array values are skipped.
   *
   * These parameters are unfortunately reversed from the standard
   * C<insertAfter> function. The convention of passing the target element as
   * the first parameter is consistent in this module.
   */

  this.insertChildrenAfter = function (elem, children) {
    elem = ecma.dom.getElement(elem);
    if (!ecma.util.defined(elem)) throw new Error('[insertChildrenAfter] elem not defined');
    if (!ecma.util.defined(children)) throw new ecma.window.Error('[insertChildrenAfter] missing children');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (!ecma.util.defined(child)) throw new Error('[insertChildrenAfter] undefined child node');
      if (child instanceof Array) {
        elem = ecma.dom.insertChildrenAfter(elem, child);
      } else {
        elem = ecma.dom.insertAfter(child, elem);
      }
    }
    return elem;
  };

  /**
   * @function insertChildrenBefore
   * Insert children before an existing element
   *  @param elem <ID or Element> which the child nodes are to preceed
   *  @param children <Array> to insert
   */

  this.insertChildrenBefore = function (elem, children) {
    elem = ecma.dom.getElement(elem);
    if (!ecma.util.defined(elem)) throw new Error('[insertChildrenBefore] elem not defined');
    if (!ecma.util.defined(children)) throw new ecma.window.Error('missing children');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (!ecma.util.defined(child)) throw new Error('undefined child node');
      if (child instanceof Array) {
        elem = ecma.dom.insertChildrenBefore(elem, child);
      } else {
        elem.parentNode.insertBefore(child, elem);
      }
    }
    return elem;
  };

  /**
   * @function insertBefore
   * Insert an element before another.
   *  @param elem Element to insert
   *  @param target Element which it is to precede
   */

  this.insertBefore = function (elem, target) {
    if (!(ecma.util.defined(target) && ecma.util.defined(elem))) return;
    var p = target.parentNode;
    if (!p) throw new Error('undefined parent node');
    p.insertBefore(elem, target);
  };

  /**
   * @function insertAfter
   * Insert an element after another.
   *  @param elem Element to insert
   *  @param target Element which is to precede it
   */

  this.insertAfter = function (elem, target) {
    if (!(ecma.util.defined(target) && ecma.util.defined(elem))) return;
    var p = target.parentNode;
    if (!p) throw new Error('undefined parent node');
    if (p.lastChild === target) {
      p.appendChild(elem);
      ecma.lang.assert(p.lastChild === elem);
    } else {
      p.insertBefore(elem, target.nextSibling);
      ecma.lang.assert(target.nextSibling === elem);
    }
    return elem;
  };

  /**
   * @function removeChildren
   * Remove all child nodes from an element
   *  @param element|id Element or Element ID
   */

  this.removeChildren = _fork(function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!(elem && elem.childNodes)) return;
    var result = [];
    for (var idx = elem.childNodes.length - 1; idx >= 0; idx--) {
      result.push(elem.removeChild(elem.childNodes[idx]));
    }
    return result;
  });

  /**
   * @function removeElement
   * Remove a node from the document if it exists and has a parent.
   *  var removedElement = ecma.dom.removeElement(elem);
   */

  this.removeElement = _fork(function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var pElem = elem.parentNode;
    if (!pElem) return;
    return pElem.removeChild(elem);
  });

  /**
   * @function removeElements
   * Remove multiple nodes from the document.  If the node does not have a
   * parent it is ignored.
   *  var removedElements = ecma.dom.removeElements(elem1);
   *  var removedElements = ecma.dom.removeElements(elem1, elem2, ...);
   *  var removedElements = ecma.dom.removeElements([elem1, elem2, ...]);
   */

  this.removeElements = function () {
    var args = ecma.util.args(arguments);
    var result = [];
    while (args && args.length > 0) {
      var arg = args.shift();
      if (ecma.util.isArray(arg)) {
        result = result.concat(ecma.dom.removeElements.apply(ecma.dom, arg));
      } else {
        result.push(ecma.dom.removeElement(arg));
      }
    }
    return result;
  };

  /**
   * @function removeElementOrphanChildren
   * Remove a node from the document if it exists and has a parent, however do
   * not remove its children.
   *  ecma.dom.removeElementOrphanChildren(elem1);
   */

  this.removeElementOrphanChildren = function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var pElem = elem.parentNode;
    if (!pElem) return;
    while (elem.firstChild) {
      pElem.insertBefore(elem.firstChild, elem);
    }
    return pElem.removeChild(elem);
  };

  /**
   * @function insertElementAdoptChildren
   * Insert a child element, adopting all of the parent element's children.
   *  ecma.dom.insertElementAdoptChildren(elem, parentElem);
   */

  this.insertElementAdoptChildren = function (elem, parentElem) {
    elem = ecma.dom.getElement(elem);
    parentElem = ecma.dom.getElement(parentElem);
    if (!(parentElem && elem)) return;
    if (parentElem.firstChild) {
      parentElem.insertBefore(elem, parentElem.firstChild);
      while (elem.nextSibling) {
        elem.appendChild(elem.nextSibling);
      }
    } else {
      parentElem.appendChild(elem);
    }
  };

  /**
   * @function replaceElement
   * Replaces the given child element with another.
   *  var elem = ecma.dom.replaceElement(newElem, elem);
   */

  this.replaceElement = function (newElem, elem) {
    elem.parentNode.insertBefore(newElem, elem);
    return elem.parentNode.removeChild(elem);
  };

  /**
   * @function isChildOf
   * Is an element a child of another?
   *
   *  <div id="id1">
   *    <div id="id2">
   *    </div>
   *  </div>
   *
   *  var bool = ecma.dom.isChildOf('id2', 'id1'); // true
   */

  this.isChildOf = function (elem, parentElem) {
    var y = ecma.dom.getElement(parentElem);
    var x = ecma.dom.getElement(elem);
    while (x && y) {
      if (x === y) return true;
      if (x === x.parentNode) break;
      x = x.parentNode;
    }
    return false;
  };

  /**
   * @function makePositioned
   * Give the element a positioned style
   *  @param elem Element or Element ID
   */

  this.makePositioned = function (elem) {
    elem = ecma.dom.getElement(elem);
    var pos = ecma.dom.getStyle(elem, 'position');
    if (pos == 'static' || !pos) {
      elem.style.position = 'relative';
      if (ecma.dom.browser.isOpera) {
        ecma.dom.setStyle(elem, 'top', 0);
        ecma.dom.setStyle(elem, 'left', 0);
      }
    }
    return elem;
  };

  /**
   * @function getStyle
   * Get CSS property
   */

  var _getComputedStyle;
  try {
    _getComputedStyle = ecma.document.defaultView.getComputedStyle;
  } catch (ex) {
    _getComputedStyle = ecma.window.getComputedStyle;
  }

  this.getStyle = function (elem, propName) {
    elem = ecma.dom.getElement(elem);
    if (!(elem && propName && elem.style)) return;
    propName = ecma.dom.translateStyleName(propName);
    if (_getComputedStyle) {
      var hyphenated = ecma.util.asHyphenatedName(propName);
      var cs = _getComputedStyle(elem,undefined)
      return cs ? cs.getPropertyValue(hyphenated) : undefined;
    } else if (elem.currentStyle) {
      var camelCase = ecma.util.asCamelCaseName(propName);
      return elem.currentStyle[camelCase];
    } else {
      var camelCase = ecma.util.asCamelCaseName(propName);
      return elem.style[camelCase];
    }
  };

  /**
   * @function setStyle
   * Sets a style property on an element.
   *
   *  ecma.dom.setStyle(elem, styleName, value)
   *  ecma.dom.setStyle(elem, styleName, value, importance)
   *
   * Where:
   *
   *  elem      <Element>   Identifier or reference
   *  styleName <String>    Property name, like "background-color"
   *  value     <String>    Property value
   *  importance            Only used when C<style.setProperty> is supported
   *
   * The xbrowser diffferences between C<cssFloat> and C<float> are translated
   * accordingly.
   *
   * Tries to use C<style.setProperty>, otherwise converts the style name to
   * its camel-cased counterpart and sets the style-object member.
   *
   * When an exception is thrown, i.e., style name is not supported, the
   * exception message is rewritten in a meaningful way, then rethrown.
   */

  this.setStyle = function (elem, propName, propValue, importance) {
    var elem = ecma.dom.getElement(elem);
    if (!elem || !elem.style) return;
    propName = ecma.dom.translateStyleName(propName);
    propValue = new String(propValue).toString();
    try {
      if (ecma.util.defined(elem.style.setProperty)) {
        elem.style.setProperty(propName, propValue, importance ? importance : null);
      } else {
        propName = ecma.util.asCamelCaseName(propName);
        elem.style[propName] = propValue;
      }
    } catch (ex) {
      if (ecma.dom.browser.isIE) {
        if (ex instanceof Object) {
          // The standard "Invalid argument" message is next to meaningless.
          // this happens when in IE you set a style to a seemingly invalid
          // value.  TODO Limit this catch to just those exceptions, in all
          // languages.
          ex.message = 'Cannot set style "' + propName + '" to "' + propValue + '".';
          // Strange thing, the new message does not 'commit' itself unless something
          // is done with it, like sending it to console.log.  TODO Find out what's
          // going on.
          ex.description = ex.message;
          ecma.console.log(ex.message);
        }
      }
      throw ex;
    }
  };

  /**
   * @function translateAttributeName
   * Returns the name of the element attribute in the language running platform
   *  var attrName = ecma.dom.translateAttributeName('className');
   */

  this.translateAttributeName = function (name) {
    if (name == 'className' || name == 'class' && ecma.platform.isIE) {
      if (ecma.document.documentMode && ecma.document.documentMode > 7) {
        return 'class';
      } else {
        return 'className';
      }
    }
    return name;
  };

  /**
   * @function translateStyleName
   * Returns the style property-name in the language of the running platform
   *  var styleName = ecma.dom.translateStyleName('cssFloat');
   */

  this.translateStyleName = function (name) {
    if (name == 'cssFloat' && !ecma.dom.browser.isIE) return 'float';
    if (name == 'cssFloat' && ecma.dom.browser.isIE) return 'styleFloat';
    if (name == 'float' && ecma.dom.browser.isIE) return 'styleFloat';
    if (name == 'float' && ecma.dom.browser.isOpera) return 'cssFloat';
    return name;
  };

  /**
   * @function setStyles
   * Sets multiple style values.
   *  ecma.dom.setStyles(elem, styles)
   *  ecma.dom.setStyles(elem, styles, importance)
   * Where:
   *  elem      <Element>   Identifier or reference
   *  styles    <Object>    Name-value style pairs
   *  importance            Stylesheet importance property
   * For example:
   *  ecma.dom.setStyles('mydiv', {'width':'10px','height':'20px'});
   */
  this.setStyles = function (elem, styles, importance) {
    for (var name in styles) {
      ecma.dom.setStyle(elem, name, styles[name], importance);
    }
  };

  /**
   * @function removeStyle
   * Remove the style property from the given element.
   *  ecma.dom.removeStyle(elem, 'background-image');
   */

  this.removeStyle = function (elem, propName) {
    elem = ecma.dom.getElement(elem);
    propName = ecma.dom.translateStyleName(propName);
    if (!elem) throw new ecma.error.MissingArg('elem');
    if (!propName) throw new ecma.error.MissingArg('propName');
    if (typeof(elem.style.removeProperty) == 'function') {
      elem.style.removeProperty(propName);
    } else if (elem.style.removeAttribute) {
      elem.style.removeAttribute(propName);
    } else {
      propName = ecma.util.asCamelCaseName(propName);
      try {
        elem.style[propName] = null;
      } catch (ex) {
        if (ex instanceof Object) {
          ex.description = 'Cannot remove style "' + propName + '".';
        }
        throw ex;
      }
    }
  };

  /**
   * @function hasClassName
   * css class names
   */

  this.hasClassName = function (elem, name) {
    var classAttr = ecma.dom.getAttribute(elem, 'class');
    if (!classAttr) return false;
    var names = classAttr.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) return true;
    }
    return false;
  };

  /**
   * @function setClassName
   */

  this.setClassName = function (elem, name) {
    ecma.dom.setAttribute(elem, 'class', name);
  }

  /**
   * @function addClassName
   */

  this.addClassName = _fork(function (elem, name) {
    var classAttr = ecma.dom.getAttribute(elem, 'class');
    var names = classAttr ? classAttr.split(/\s+/) : [];
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) return;
    }
    names.push(name);
    ecma.dom.setAttribute(elem, 'class', names.join(' '));
  });

  /**
   * @function addClassNames
   */

  this.addClassNames = _fork(function () {
    var args = ecma.util.args(arguments);
    var elem = args.shift();
    if (!elem) return;
    for (var i = 0; i < args.length; i++) {
      if (ecma.util.isArray(args[i])) {
        ecma.dom.addClassNames.apply(this, [elem].concat(args[i]));
      } else {
        ecma.dom.addClassName(elem, args[i]);
      }
    }
  });

  /**
   * @function removeClassName
   */

  this.removeClassName = _fork(function (elem, name) {
    var classAttr = ecma.dom.getAttribute(elem, 'class');
    if (!classAttr) return;
    var names = classAttr.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      if (names[i] == name) names.splice(i--, 1);
    }
    ecma.dom.setAttribute(elem, 'class', names.join(' '));
  });

  /**
   * @function removeClassNames
   */

  this.removeClassNames = _fork(function () {
    var args = ecma.util.args(arguments);
    var elem = args.shift();
    if (!elem) return;
    for (var i = 0; i < args.length; i++) {
      ecma.dom.removeClassName(elem, args[i]);
    }
  });

  /**
   * @function toggleClassName
   */

  this.toggleClassName = function (elem, name, enable) {
    if (!ecma.util.defined(enable)) {
      enable = !ecma.dom.hasClassName(elem, name);
    }
    if (!enable) {
      ecma.dom.removeClassName(elem, name);
      return false;
    } else {
      ecma.dom.addClassName(elem, name);
      return true;
    }
  };

  /**
   * @function getAttribute
   */

  this.getAttribute = function (elem, attrName) {
    var elem = ecma.dom.getElement(elem);
    if (!elem) return;
    if (typeof(attrName) != 'string') return;
    if (attrName.indexOf('_') == 0) {
      var v1 = elem.getAttribute(attrName);
      var v2 = elem[attrName];
      return v1 === null || v1 === undefined ? v2 : v1;
    } else if (attrName.indexOf('on') == 0) {
      // event
      attrName = attrName.toLowerCase();
      return elem[attrName];
    } else {
      if (attrName.toLowerCase() == 'text'
          || attrName.toLowerCase() == 'tagname'
          || attrName.indexOf('inner') == 0) {
        return elem[attrName];
      } else if (elem.attributes && elem.attributes.getNamedItem) {
        // getNamedItem comes before getAttribute test because IE still returns
        // the innerHTML when getting the 'value' attribute from a BUTTON
        // element.
        var attr = elem.attributes.getNamedItem(attrName);
        return attr ? attr.value : attr;
      } else if (elem.getAttribute) {
        attrName = ecma.dom.translateAttributeName(attrName);
        return elem.getAttribute(attrName);
      } else {
        return elem[attrName];
      }
    }
  };

  /**
   * @function setAttribute
   * Set element attribute
   */

  this.setAttribute = function (elem, attrName, attrValue) {
    var elem = ecma.dom.getElement(elem);
    if (!elem) return;
    if (typeof(attrName) != 'string') return;
    if (attrName.indexOf('_') == 0) {
      // user-defined property
      elem[attrName] = attrValue;
    } else if (attrName.indexOf('on') == 0) {
      // event
      if (ecma.util.isArray(attrValue)) {
        // An event which is an array is considered arguments to create a callback
        ecma.dom.addEventListener.apply(ecma.dom,
            [elem, attrName].concat(attrValue));
      } else if (typeof(attrValue) == 'function') {
        ecma.dom.addEventListener(elem, attrName, attrValue);
      } else {
        attrName = attrName.toLowerCase();
        elem[attrName] = attrValue;
      }
    } else {
      if (attrName.toLowerCase() == 'value') {
        // When the browser (FF) is remembering values, simply setting the attribute
        // does not reflect the most "current" value of the control.  Since you're
        // calling this method from script, we presume you want the control to reflect
        // this new value.
        if (elem.attributes && elem.attributes.setNamedItem) {
          var namedItem = ecma.document.createAttribute('value');
          namedItem.value = attrValue;
          elem.attributes.setNamedItem(namedItem);
          elem.value = attrValue;
          return;
        } else {
          elem.value = attrValue;
          if (ecma.util.defined(elem.setAttribute)) {
            elem.setAttribute(attrName, attrValue);
          }
        }
      }
      attrName = ecma.dom.translateAttributeName(attrName);
      if (!ecma.util.defined(elem.setAttribute)
          || attrName.toLowerCase() == 'text'
          || attrName.indexOf('inner') == 0) {
        elem[attrName] = attrValue;
      } else {
        elem.setAttribute(attrName, attrValue);
      }
    }
  };

  /**
   * @function removeAttribute
   */

  this.removeAttribute = function (elem, attrName) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    elem.removeAttribute(attrName);
  };

  /**
   * @function getOpacity
   */

  this.getOpacity = function (elem) {
    var result = undefined;
    if (ecma.dom.browser.isIE
        && (!ecma.document.documentMode || ecma.document.documentMode < 9)) {
      var styleText = ecma.dom.getStyle(elem, 'filter')
          || ecma.dom.getStyle(elem, '-ms-filter')
          || '';
      var matched = styleText.match(/opacity\s*=\s*(\d+)/i);
      var percent = matched ? matched[1] : 100;
      result = (percent / 100);
    } else if (ecma.dom.browser.isGecko) {
      var opacity = ecma.dom.getStyle(elem, 'opacity');
      if (!ecma.util.isDefined(opacity)) {
        opacity = ecma.dom.getStyle(elem, '-moz-opacity');
      }
      if (!ecma.util.isDefined(opacity)) {
        opacity = '1';
      }
      result = parseFloat(opacity);
    } else if (ecma.dom.browser.isWebKit) {
      var opacity = ecma.dom.getStyle(elem, 'opacity');
      if (!ecma.util.isDefined(opacity)) {
        opacity = ecma.dom.getStyle(elem, '-khtml-opacity');
      }
      if (!ecma.util.isDefined(opacity)) {
        opacity = '1';
      }
      result = parseFloat(opacity);
    } else {
      var opacity = ecma.dom.getStyle(elem, 'opacity');
      if (!ecma.util.isDefined(opacity)) {
        opacity = '1';
      }
      result = parseFloat(opacity);
    }
    return result.toFixed(2);
  };

  /**
   * @function setOpacity
   */

  this.setOpacity = function (elem, opacity) {
    opacity = (Math.round(opacity * 10000) / 10000);
    if (ecma.dom.browser.isIE
        && (!document.documentMode || document.documentMode < 9)) {
      opacity *= 100;
      ecma.dom.setStyle(elem, '-ms-filter', 'alpha(opacity='+opacity+')');
      ecma.dom.setStyle(elem, 'filter', 'alpha(opacity='+opacity+')');
    } else if (ecma.dom.browser.isGecko) {
      ecma.dom.setStyle(elem, '-moz-opacity', opacity);
      ecma.dom.setStyle(elem, 'opacity', opacity);
    } else if (ecma.dom.browser.isWebKit) {
      ecma.dom.setStyle(elem, '-khtml-opacity', opacity);
      ecma.dom.setStyle(elem, 'opacity', opacity);
    } else {
      ecma.dom.setStyle(elem, 'opacity', opacity);
    }
  };

  /**
   * @function getCenteredPosition
   * Get the (x, y) pixel coordinates which will center the
   * element relative to the viewport (or contextElem if it is provided)
   *
   *  @param element
   *  @param contextElem (optional)
   */

  this.getCenteredPosition = function (elem, contextElem) {
    elem = ecma.dom.getElement(elem);
    var vp;
    if (contextElem) {
      vp = ecma.dom.getElementPosition(contextElem);
    } else {
      vp = ecma.dom.getViewportPosition();
    }
    var pos = ecma.dom.getElementPosition(elem);
    var x = vp['left'] + (vp['width'] / 2) - (pos['width'] / 2);
    var y = vp['top'] + (vp['height'] / 2) - (pos['height'] / 2);
    if (x < vp['left']) x = vp['left'];
    if (y < vp['top']) y = vp['top'];
    return {'top': y, 'left': x};
  };

  /**
   * @function setPosition
   * Position an absolute element with respect to the view port
   * setPosition #elem, {props}
   * where:
   *  props.position: 'top-third'|'center'|'bottom-left'
   */

  this.setPosition = function (elem, props) {
    elem = ecma.dom.getElement(elem);
    if (!props) props = {'position': 'top-third'}
    /* Backup display values */
    var attrVisibility = elem.style.visibility;
    var attrDisplay = elem.style.display;
    /* Set display values */
    elem.style.visibility = 'hidden'; // don't flicker when positioning
    elem.style.display = 'block'; // so get height/width work
    /* Calculate new position */
    var vp = ecma.dom.getViewportPosition();
    var xy = ecma.dom.getCenteredPosition(elem, props.contextElem);
    if (props.position == 'top-third') {
      var h = ecma.dom.getHeight(elem);
      var t = (vp.height - h)/3;
      if (t < 0) t = ecma.util.asInt(ecma.dom.canvas.scrollY());
      if (t < ecma.dom.canvas.scrollY()) t += ecma.dom.canvas.scrollY();
      elem.style.left = xy.left + "px";
      elem.style.top = t + "px";
    } else if (props.position == 'center') {
      elem.style.left = xy.left + "px";
      elem.style.top = xy.top + "px";
    } else if (props.position == 'bottom-left') {
      vp['left'] += ecma.util.asInt(ecma.dom.getStyle(elem, 'padding-left'));
      vp['top'] -= ecma.util.asInt(ecma.dom.getStyle(elem, 'padding-bottom'));
      elem.style.left = vp['left'] + 'px';
      elem.style.top = (vp['top'] + vp['height'] - ecma.dom.getHeight(elem)) + 'px';
    } else if (props.position == 'bottom-right') {
      elem.style.right = '0px';
      elem.style.bottom = '0px';
    }
    /* Restore original values */
    elem.style.visibility = attrVisibility;
    elem.style.display = attrDisplay;
  };

  /**
   * @function getElementPosition
   * Pixel coordinates and dimensions of the element
   * returns: Object w/members: left, top, width, height
   */

  this.getElementPosition = function (elem) {
    elem = ecma.dom.getElement(elem);
    return {
      'left':   ecma.dom.getLeft(elem),
      'top':    ecma.dom.getTop(elem),
      'width':  ecma.dom.getWidth(elem),
      'height': ecma.dom.getHeight(elem)
    };
  };

  /**
   * @function getInnerPosition
   */

  this.getInnerPosition = function (elem) {
    return {
      'top':    ecma.dom.getInnerTop(elem),
      'left':   ecma.dom.getInnerLeft(elem),
      'right':  ecma.dom.getInnerRight(elem),
      'bottom': ecma.dom.getInnerBottom(elem),
      'width':  ecma.dom.getInnerWidth(elem),
      'height': ecma.dom.getInnerHeight(elem)
    };
  };

  /**
   * @function getTop
   * https://developer.mozilla.org/En/Determining_the_dimensions_of_elements
   * http://msdn.microsoft.com/en-us/library/ms530302(VS.85).aspx
   *
   *  elem.getBBox          # svg x,y and width,height
   *
   *  elem.scrollHeight     # height of actual content
   *  elem.clientHeight     # height of visible content
   *  elem.offsetHeight     # height of element
   *
   *  elem.scrollWidth      # width of actual content (except IE)
   *  elem.clientWidth      # width of visible content
   *  elem.offsetWidth      # width of element
   */

  this.getTop = function (elem)    {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().y : elem.offsetTop;
    result += ecma.dom.getTop(elem.offsetParent);
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getBottom
   */

  this.getBottom = function (elem) {
    return ecma.dom.getTop(elem) + ecma.dom.getHeight(elem);
  };

  /**
   * @function getLeft
   */

  this.getLeft = function (elem)   {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().x : elem.offsetLeft;
    result += ecma.dom.getLeft(elem.offsetParent);
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getRight
   */

  this.getRight = function (elem)  {
    return ecma.dom.getLeft(elem) + ecma.dom.getWidth(elem);
  };

  /**
   * @function getWidth
   */

  this.getWidth = function (elem)  {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().width : elem.offsetWidth;
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getHeight
   */

  this.getHeight = function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().height : elem.offsetHeight;
    return isNaN(result) ? 0 : result;
  };

  /* Inner */

  /**
   * @function getInnerTop
   */

  this.getInnerTop = function (elem)    {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().y : elem.offsetTop + elem.clientTop;
    result += ecma.dom.getInnerTop(elem.offsetParent);
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getInnerBottom
   */

  this.getInnerBottom = function (elem) {
    return ecma.dom.getInnerTop(elem) + ecma.dom.getInnerHeight(elem);
  };

  /**
   * @function getInnerLeft
   */

  this.getInnerLeft = function (elem)   {
    elem = ecma.dom.getElement(elem);
    if (!elem) return 0;
    var result = elem.getBBox ? elem.getBBox().x : elem.offsetLeft + elem.clientLeft;
    result += ecma.dom.getInnerLeft(elem.offsetParent);
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getInnerRight
   */

  this.getInnerRight = function (elem)  {
    return ecma.dom.getInnerLeft(elem) + ecma.dom.getInnerWidth(elem);
  };

  /**
   * @function getInnerWidth
   */

  this.getInnerWidth = function (elem)  {
    elem = ecma.dom.getElement(elem);
    if (!elem || ecma.dom.node.isText(elem)) return 0;
    var result = elem.getBBox
      ? elem.getBBox().width
        : elem.clientWidth;
    if (!result) result = elem.offsetWidth - elem.clientLeft;
    return isNaN(result) ? 0 : result;
  };

  /**
   * @function getInnerHeight
   */

  this.getInnerHeight = function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!elem || ecma.dom.node.isText(elem)) return 0;
    var result = elem.getBBox ? elem.getBBox().height : elem.clientHeight;
    if (!result) result = elem.offsetHeight - elem.clientTop;
    return isNaN(result) ? 0 : result;
  };

  /** Content */

  /**
   * @function getContentWidth
   */

  function _getContentWidth (elem, result) {
    while (elem) {
      result = Math.max(result, ecma.dom.getWidth(elem));
      var overflow = ecma.dom.getStyle(elem, 'overflowY');
      if ((!overflow || overflow == 'visible') && elem.hasChildNodes()) {
        result = _getContentWidth(elem.firstChild, result);
      }
      elem = elem.nextSibling;
    }
    return result;
  }

  this.getContentWidth = function (elem)  {
    elem = ecma.dom.getElement(elem);
//  return _getContentWidth(elem.firstChild, ecma.dom.getWidth(elem));
    return _getContentWidth(elem.firstChild, 0);
  };

  /**
   * @function getContentHeight
   */

  function _getContentHeight (elem, result) {
    while (elem) {
      result = Math.max(result, ecma.dom.getHeight(elem));
      var overflow = ecma.dom.getStyle(elem, 'overflowX');
      if ((!overflow || overflow == 'visible') && elem.hasChildNodes()) {
        result = _getContentHeight(elem.firstChild, result);
      }
      elem = elem.nextSibling;
    }
    return result;
  }

  this.getContentHeight = function (elem)  {
    elem = ecma.dom.getElement(elem);
//  return _getContentHeight(elem.firstChild, ecma.dom.getHeight(elem));
    return _getContentHeight(elem.firstChild, 0);
  };

  /**
   * @idea getOuterWidth
   * @idea getOuterHeight
   *
   * Or maybe getBBox, basically returns width x height of the bounding
   * box. In some instances the ua does not include the border width,
   * which is often desired. Since margins overlap, doesn't make sense
   * to include them.
   */

  /**
   * @function getValues
   * Get name/value pairs from descendants.
   *  var obj = ecma.dom.getValues(element);
   *  var obj = ecma.dom.getValues(element, ['input','textarea']);
   */

  this.getValues = function (elem, tagNames) {
    elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var result = {};
    if (!tagNames) tagNames = ['input','textarea','select']; 
    for (var i = 0, tagName; tagName = tagNames[i]; i++) {
      var nodeList = elem.getElementsByTagName(tagName);
      for (var j = 0, node; node = nodeList[j]; j++) {
        var name = ecma.dom.getAttribute(node, 'name');
        if (!name) continue;
        var value = ecma.dom.getValue(node);
        if (ecma.util.defined(result[name])) {
          var attrName = node.tagName;
          var attrType = ecma.dom.getAttribute(node, 'type') || '';
          if (attrName.toUpperCase() == 'INPUT' && attrType.toUpperCase() == 'RADIO') {
            if (result[name] && !value) continue;
            result[name] = value;
          } else {
            if (!ecma.util.defined(value)) continue;
            if (ecma.util.isArray(result[name])) {
              result[name].push(value);
            } else {
              result[name] = [result[name], value];
            }
          }
        } else {
          result[name] = value;
        }
      }
    }
    return result;
  };

  /**
   * @function getValue
   * Get the logical value according to element type.
   *  @param elem <ID or Element> from which to get the value
   */

  this.getValue = function (elem) {
    function resolveValue (value) {
      if (value.match(/^&:/)) {
        return ecma.dom.getValue(value.replace(/^&:/, ''));
      }
      return value;
    }
    var elem = ecma.dom.getElement(elem);
    if (!elem) return;
    var value = undefined;
    switch (elem.tagName.toUpperCase()) {
      case 'INPUT':
        switch (elem.type.toUpperCase()) {
          case 'HIDDEN':
            value = resolveValue(elem.value);
            break;
          case 'CHECKBOX':
            value = elem.checked
              ? ecma.util.defined(elem.value)
                ? resolveValue(elem.value)
                : true
              : undefined;
            break;
          case 'RADIO':
            if (elem.checked) {
              value = ecma.util.defined(elem.value) ? resolveValue(elem.value) : true;
            } else {
              value = undefined;
            }
            break;
          case 'SUBMIT':
          case 'PASSWORD':
          case 'TEXT':
          case 'FILE':
            value = elem.value;
            break;
          default:
            throw new Error('Unhandled input type: '+elem.type);
        }
        break;
      case 'BUTTON':
        value = ecma.dom.getAttribute(elem, 'value');
        break;
      case 'TEXTAREA':
      case 'SELECT':
        value = elem.value;
        break;
      default:
        if (ecma.util.defined(elem.innerHTML)) {
          value = elem.innerHTML;
        } else {
          throw new Error('Unhandled tag: '+elem.tagName);
        }
    }
    return value;
  };

  /**
   * @function setValue
   * Sets the value for the given element.
   *
   *  var value = ecma.dom.setValue(elem, value);
   *
   * Where:
   *
   *  elem    <Element>     Identifier or reference
   *  value   <String>      New value
   *
   * When C<elem.tagName> is ___, the property we set is ___:
   *
   *  INPUT['hidden']       value
   *  INPUT['password']     value
   *  INPUT['text']         value
   *  INPUT['radio']        value || checked L<1>
   *  INPUT['checkbox']     value || checked L<1>
   *  SELECT                value
   *  TEXTAREA              value
   *  PRE                   innerHTML L<2>
   *  *                     innerHTML or innerText or <Excpetion> L<3>
   *
   * N<1> When setting radio and checkbox input fields: if the value is a 
   * boolean or the string 'on' or 'off', we will set the checked property; 
   * otherwise the value is set.
   *
   * N<2> Internet Explorer workaround: When setting the C<innerHTML> member of 
   * a PRE element we create a temporary (DIV) container, set its innerHTML 
   * member, then replace the PRE's children with these newborns.
   *
   * N<3> If C<elem.innerHTML> is defined it is set, otherwise if
   * C<elem.innerText> is defined, it is set.  Otherwise an unhandled tag 
   * exception is thrown.
   */

  this.setValue = function (elem, value) {
    var elem = ecma.dom.getElement(elem);
    if (!elem) return;
    switch (elem.tagName.toUpperCase()) {
      case 'INPUT':
        switch (elem.type.toUpperCase()) {
          case 'HIDDEN':
          case 'PASSWORD':
          case 'TEXT':
            elem.value = value;
            break;
          case 'CHECKBOX':
          case 'RADIO':
            var checked = elem.checked;
            if (typeof(value) == 'boolean') {
              checked = value;
            } else {
              if (value == 'on') {
                checked = true;
              } else if (value == 'off') {
                checked = false;
              } else {
                elem.value = value;
              }
            }
            elem.checked = checked;
            break;
          default:
            throw new Error('Unhandled input type: '+elem.type);
        }
        break;
      case 'TEXTAREA':
      case 'SELECT':
        elem.value = value;
        break;
      case 'PRE':
        if (ecma.dom.browser.isIE) {
          // Workaround as the IE innerHTML parser ignores the excess whitespace.
          var div = ecma.dom.createElement('div', {innerHTML:'<pre>'+value+'</pre>'});
          ecma.dom.replaceChildren(elem, div.childNodes);
        } else {
          ecma.dom.setAttribute(elem, 'innerHTML', value);
        }
        break;
      default:
        if (ecma.util.defined(elem.innerHTML)) {
          ecma.dom.setAttribute(elem, 'innerHTML', value);
        } else if (ecma.util.defined(elem.innerText)) {
          ecma.dom.setAttribute(elem, 'innerText', value);
        } else {
          throw new Error('Unhandled tag: '+elem.tagName);
        }
    }
    return value;
  };

  /**
   * @function clearSelection
   * Clear the user selection (e.g., highlighted text)
   */

  this.clearSelection = function() {
    if (ecma.document.selection && ecma.document.selection.empty) {
      ecma.document.selection.empty();
    } else if (window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
    }
  };

  /**
   * @function toggleDisplay
   */

  this.toggleDisplay = function (elem, blockStyle, bShow) {
    if (!blockStyle) blockStyle = 'block';
    var currentValue = ecma.dom.getStyle(elem, 'display');
    if (!ecma.util.defined(bShow)) {
      bShow = currentValue == 'none';
    }
    if (!bShow) {
      ecma.dom.setStyle(elem, 'display', 'none');
      return false;
    } else {
      ecma.dom.setStyle(elem, 'display', blockStyle);
      return true;
    }
  };

  /**
   * @function getScrollableParent
   */

  this.getScrollableParent = function (elem) {
    if (!elem) return undefined;
    var result = null;
    var node = elem.parentNode;
    var body = ecma.dom.getBody();
    while (!result && node) {
      var overflow = ecma.dom.getStyle(node, 'overflow');
      if (overflow && overflow.match(/auto|scroll/i)) {
        result = node;
      } else {
        node = node === body ? null : node.parentNode;
      }
    }
    return result;
  };

  /**
   * @function scrollTo
   * Scroll to the specified element
   *
   *  @param elem <Element> Scroll to the top of this element
   *  @param se <Element> (Optional) The scrollable element to be scrolled
   *
   *  // The scrollable element will be searched for. If there are no scrolable
   *  // parents, this is a no-op.
   *  ecma.dom.scrollTo(elem);
   *
   *  // The provided scrollable element will be scrolled
   *  ecma.dom.scrollTo(elem, scrollableElement);
   *
   */

  this.scrollTo = function (elem, se) {
    if (!se) {
      se = this.getScrollableParent(elem); // scroll elem
      if (!se) return;
    }
    var sh = ecma.dom.getHeight(se); // scroll height
    var st = se.scrollTop; // scroll top
    var te = elem; //  target elem
    var tt = ecma.dom.getTop(te) - ecma.dom.getTop(se); // target top
    var tb = ecma.dom.getBottom(te) - ecma.dom.getTop(se); // target bottom
    if ((tb > (st + sh)) || (tt < st)) {
      se.scrollTop = ecma.util.asInt(tt - (sh/2));
    }
  };

});

/** @namespace util */

ECMAScript.Extend('util', function (ecma) {

  /**
   * @function asHyphenatedName
   * Convert a camel-cased name to hypenated.
   *  @param name to convert
   */

  this.asHyphenatedName = function (name) {
    function upperToHyphenLower(match) { return '-' + match.toLowerCase(); }
    return name.replace(/[A-Z]/g, upperToHyphenLower);
  };

  /** 
   * @function asCamelCaseName
   * Convert the hyphenated name to camel-cased.
   *  @param name to convert
   */

  this.asCamelCaseName = function (name) {
    function ucFirstMatch(str, p1, offest, s) { return p1.toUpperCase(); }
    return name.replace(/-([a-z])/g, ucFirstMatch);
  };

});
