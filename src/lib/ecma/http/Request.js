/** @namespace http */

/**
 *  TODO: Allow cross-domain requests.  The newXHR method will need to detect
 *  browser support and create the appropriate object in IE.
 *
 *  https://developer.mozilla.org/en/http_access_control
 *  http://msdn.microsoft.com/en-us/library/cc288060%28v=vs.85%29.aspx
 *  http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
 *  http://msdn.microsoft.com/en-us/library/dd573303%28v=vs.85%29.aspx
 */

ECMAScript.Extend('http', function (ecma) {

  /**
   * @constant XHR_UNINITIALIZED
   * @constant XHR_LOADING
   * @constant XHR_LOADED
   * @constant XHR_INTERACTIVE
   * @constant XHR_COMPLETE
   */

  this.XHR_UNINITIALIZED = 0;
  this.XHR_LOADING       = 1;
  this.XHR_LOADED        = 2;
  this.XHR_INTERACTIVE   = 3;
  this.XHR_COMPLETE      = 4;

  /**
   * @constant XHR_STATE_NAMES
   */

  this.XHR_STATE_NAMES   = [
    'Uninitialized',
    'Loading',            // Connection established
    'Loaded',             // Request received
    'Interactive',        // Answer in process
    'Complete'
  ];

  /**
   * @function newXHR
   * Creates a new XMLHttpRequest object as provided by the platform.
   *  var xhr = js.http.newXHR();
   */

  this.newXHR = function () {
    try {
      return new XMLHttpRequest();
    } catch (ex) {
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (ex) {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }
  };

  /**
   * @class Request
   *
   * XMLHttpRequest wrapper with hooks for resopnse callbacks.
   *
   * @param uri of the request
   * @param options for the request
   *
   * Several ways to do the same thing:
   *
   *  var req = new js.http.Request('http://www.example.com');
   *  req.onSuccess = function (xhr) {
   *    alert(xhr.responseText);
   *  };
   *
   *  var req = new js.http.Request('http://www.example.com');
   *  req.addEventListener('onSuccess', function () { ... });
   *  req.submit();
   *
   * Note that we do *not* set 'Connection: close' as this is client
   * specific, i.e., only user agents which do not support persistent
   * connections.  Doing so will yield an error in Opera.
   */

  var CActionDispatcher = ecma.action.ActionDispatcher;

  this.Request = function CRequest (uri, options) {
    CActionDispatcher.apply(this);
    this.uri = uri;
    this.method = 'GET';
    this.asynchronous = true;
    this.body = null;
    this.headers = {
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    this.events = [];
    // Option parsing intended to be compatible with Prototype.js
    var props = {};
    for (var k in options) {
      if (k.match(/^on/)) {
        this.addEventListener(k, options[k]);
      } else {
        props[k] = options[k];
      }
    }
    ecma.util.overlay(this, props);
  };

  this.Request.prototype = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @internal getEventListeners
   * Returns an array of event listeners for the specified event type.
   *
   *  var array = getEventListeners(type);
   *
   * Where:
   *
   *  type  <String>  Event type, e.g., "onSuccess"
   *
   * Each entry in the array is a callback array in the form of:
   *
   *  [func, scope, args]
   */

  this.Request.prototype.getEventListeners = function (type) {
    var name = type.toLowerCase().replace(/^on/, '');
    return this.events[name];
  };

  /**
   * @internal setEventListeners
   * Replaces current array of listeners with new array.
   *
   *  setEventListeners(listeners);
   *
   * Where:
   *
   *  listeners <Array> New array of callback functions
   */

  this.Request.prototype.setEventListeners = function (type, listeners) {
    var name = type.toLowerCase().replace(/^on/, '');
    this.events[name] = listeners;
  };

  /**
   * @function addEventListener
   * Adds a new event listener.
   *
   *  req.addEventListener(type, func);
   *  req.addEventListener(type, func, scope);
   *  req.addEventListener(type, func, scope, args);
   *
   * Where:
   *  
   *  type    <String>      Event type L<1>
   *  func    <Function>    Callback function L<2>
   *  scope   <Object>      Scope applied to `func`
   *  args    <Array>       Arguments passed to `func` L<3>
   *
   * N<1> Event types are determined by the HTTP status returned by the request,
   * are case insensitive, and are not requred to use the 'on' prefix.  Events
   * types may also literal HTTP status numbers, which have precedence. The 
   * following are synonymous:
   *
   *  req.addEventListener('onInternalServerError', ...);
   *  req.addEventListener('InternalServerError', ...);
   *  req.addEventListener('internalservererror', ...);
   *  req.addEventListener(500, ...);
   *
   * See also: L<ecma.lang.HTTP_STATUS_NAMES>
   *
   * N<2> When no C<scope> is provided, the C<func> is called with C<req>
   * as its scope.
   *
   * N<3> Callback functions are always passed the XMLHttpRequest object as
   * the first argument.  Any additional arguments specified in the C<args>
   * parameter are appended thereafter.
   */

  this.Request.prototype.addEventListener = function (type, func, scope, args) {
    var name = type.toLowerCase().replace(/^on/, '');
    var group = this.events[name];
    if (!group) group = this.events[name] = [];
    if (!scope) scope = this;
    if (!args) args = [];
    group.push([func, scope, args]);
  };

  /**
   * @function removeEventListener
   * Removes an existing event listener.
   *
   *  req.removeEventListener(type, func)
   *
   * Where:
   *
   *  type <String> Event type
   *  func <Func)   Function reference, === to that passed in addEventListener
   *
   * TODO: Remove logic should also accept and compare C<scope>.
   */

  this.Request.prototype.removeEventListener = function (type, func) {
    var name = type.toLowerCase().replace(/^on/, '');
    var group = this.events[name];
    if (!group) return;
    for (var i = 0; i < group.length; i++) {
      var cb = group[i];
      var cbFunc = ecma.util.isArray(group[i]) ? group[i][0] : group[i]
      if (cbFunc === func) {
        group.splice(i--, 1);
        break;
      }
    }
  };

  /**
   * @function getHeader
   * Returns the value of a specific HTTP header.
   *
   *  var result = req.getHeader(name);
   *
   * Where:
   *
   *  name  <String>  Name of the header field
   *
   * Example:
   *
   *  var result = req.getHeader('If-Modified-Since');
   */

  this.Request.prototype.getHeader = function (k, v) {
    return this.headers[k];
  };

  /**
   * @function setHeader
   * Sets the value for the specified header.
   *
   *  req.setHeader(name, value);
   *
   * Where:
   *
   *  name  <String>  Name of the header field
   *  value <String>  Value of the header field
   */

  this.Request.prototype.setHeader = function (k, v) {
    return this.headers[k] = v;
  };

  function _submit () {
    this.xhr = ecma.http.newXHR();
    this.xhr.open(this.method.toUpperCase(), this.uri, this.asynchronous);
    this.xhr.onreadystatechange = js.lang.Callback(this.onStateChange, this);
    for (var k in this.headers) {
      this.xhr.setRequestHeader(k, this.headers[k]);
    }
    this.fireEvent('Create');
    this.xhr.send(this.body);
  }

  /**
   * @function submit
   * Submits the request.
   *
   *  req.submit();
   *  req.submit(body);
   *  req.submit(body, cb);
   *
   * Where:
   *
   *  body  <String|Object>   Body of the request
   *  cb    <Function|Array>  Callback (called once when the request completes)
   *
   * The C<body> argument is passed to C<parseBody>, override this in your
   * derived class if necessary.  See L<js.http.Request.parseBody> for this 
   * implementation
   */

  this.Request.prototype.submit = function (body, cb) {
    this.body = this.parseBody(body);
    this.cb = cb;
    return _submit.apply(this);
  };

  /**
   * @function resubmit
   * Submits this request again, re-using its existing body.
   *  req.resubmit();
   */

  this.Request.prototype.resubmit = function () {
    return _submit.apply(this);
  };

  /**
   * @function parseBody
   * Creates the argument for C<XMLHttpRequest.send> from that which was
   * passed to L<js.http.Request.submit>.
   *
   *  var result = req.parseBody(); // null is returned
   *  var result = req.parseBody(body);
   *
   * When C<body> is a String, it is passed as-is.  When it is an object, it is 
   * iterated and each key and value are URI-encoded and append as "key=value&" 
   * pairs.
   */

  this.Request.prototype.parseBody = function (body) {
    if (!body) return null;
    if (ecma.util.isObject(body)) {
      try {
        var result = '';
        for (var k in body) {
          var name = encodeURIComponent(k);
          var value = ecma.util.isDefined(body[k])
            ? encodeURIComponent(body[k])
            : '';
          result += name + '=' + value + '&';
        }
        return result;
      } catch (ex) {
        return body;
      }
    }
    return body;
  };

  /**
   * @function parseResponse
   * Parse the xhr.responseText as needed.
   *
   * Called when the request is complete, before any event listeners.
   *
   * Example:
   *
   *  // Create a new class derived from ecma.http.Request
   *  function MyRequest () {ecma.http.Request.apply(this, arguments);};
   *  MyRequest.prototype = ecma.lang.createPrototype(ecma.http.Request);
   *
   *  // Override the parseResponse method
   *  MyRequest.prototype.parseResponse = function () {
   *    this.responseText = this.xhr.responseText;
   *    this.responseText.replace(/</, '&lt;');
   *  };
   */

  this.Request.prototype.parseResponse = function () {
  };

  /**
   * @internal onStateChange
   * Callback for state-change events on the xhr object.
   */

  this.Request.prototype.onStateChange = function () {
    var state = this.xhr.readyState;
    if (state == ecma.http.XHR_COMPLETE) {
      if (this.canComplete()) this.completeRequest();
    } else {
      var name = ecma.http.XHR_STATE_NAMES[state];
      this.fireEvent(name);
    }
  };

  /**
   * @function canComplete
   *
   * Override this function to inspect the response and supress all
   * completion callbacks.  If you return false, call C<completeRequest()>
   * to invoke the completion callbacks.
   *
   * See C<ecma.lsn.Request> for how this is used to resubmit requests where
   * authorization is required.
   */

  this.Request.prototype.canComplete = function () {
    return true;
  };

  /**
   * @function completeRequest
   *
   * Invoke all of the callbacks associated with a completed request.
   */

  this.Request.prototype.completeRequest = function () {
    var state = this.xhr.readyState;
    this.parseResponse();
    var status = this.xhr.status || 500;
    if (this.cb) {
      try {
        this.invokeListener(this.cb);
      } catch (ex) {
        ecma.error.reportError(ex);
      } finally {
        this.cb = null;
      }
    }
    var name = ecma.http.HTTP_STATUS_NAMES[status];
    this.fireEvent(status); // on200 preceeds onSuccess and onOk
    if (name) this.fireEvent(name); // onOk preceeds onSuccess
    if (status >= 200 && status < 300) {
      this.fireEvent('Success');
    } else {
      this.fireEvent('NotSuccess');
    }
    if (status >= 500 && status < 600) {
      this.fireEvent('Failure');
    }
    var name = ecma.http.XHR_STATE_NAMES[state];
    this.fireEvent(name);
  };

  /**
   * @internal fireEvent
   * Invokes callbacks, in order.
   *
   * Written before L<js.dom.ActionListener> which should be used for
   * the event interface, sigh.
   */

  this.Request.prototype.fireEvent = function (type) {
    //ecma.console.log(this.uri + ':', type);
    // native functions (first)
    if (this['on'+type]) {
      try {
        this['on'+type].call(this, this);
      } catch (ex) {
        ecma.error.reportError(ex);
      }
    }
    // event listeners
    var name = typeof(type) == 'number' ? type : type.toLowerCase();
    var group = this.events[name];
    if (!group) return;
    try {
      ecma.util.step(group, this.invokeListener, this);
    } catch (ex) {
      ecma.error.reportError(ex);
      // Do no re-throw, we need our call-frame to continue
    }
    this.executeAction(type, this);
  };

  this.Request.prototype.invokeListener = function (cb) {
    var func, scope, args;
    var args = [this];
    if (ecma.util.isArray(cb)) {
      func = cb[0];
      scope = cb[1];
      args = args.concat(cb[2]);
    } else {
      func = cb;
      scope = this;
    }
    func.apply(scope, args);
  };

});
