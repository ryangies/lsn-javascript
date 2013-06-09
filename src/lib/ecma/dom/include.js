ECMAScript.Extend('dom.include', function (ecma) {

  /**
   * @namespace dom.include
   * This structure groups functions which incorporate CSS and JS into the 
   * current document.
   */

  var _package = this;
  var _loaded = {};
  var _onLoadCallbacks = {};

  function _getHead () {
    var heads = ecma.document.getElementsByTagName('head');
    if (!(heads && heads[0])) {
      var doc = ecma.dom.getRootElement();
      var head = ecma.dom.createElement('head');
      doc.appendChild(head);
      return head;
    }
    return heads[0];
  }

  function _setLoaded (event, id) {
    var target = ecma.dom.getEventTarget(event);
    if (ecma.dom.browser.isIE && !target.readyState.match(/complete|loaded/)) {
      return;
    }
    _loaded[id] = true;
    while (_onLoadCallbacks[id].length) {
      var cb = _onLoadCallbacks[id].shift();
      ecma.lang.callback(cb, ecma.window, [target]);
    }
  }

  /**
   * @function hasLoaded
   * Query the loaded status by script-element id.
   *  var bool = ecma.dom.hasLoaded(id);
   */

  this.hasLoaded = function (id) {
    return id && (id in _loaded ? _loaded[id] : false);
  };

  /**
   * @function script
   * Append a SCRIPT element to the document's HEAD.  If the element already
   * exists this is a no-op and the C<onLoad> callback will be immediately
   * applied.
   *
   *  var elem = ecma.dom.include.script(attrs);
   *  var elem = ecma.dom.include.script(attrs, onLoad);
   *
   * The C<attrs> object must contain either one of these two members:
   *
   *  attrs.text  Script source code
   *  attrs.src   URI of the script resource
   *
   * The element attributes C<attrs> are passed to L<ecma.dom.createElement>.
   * The following attributes will be used if provided, otherwise set:
   *
   *  attrs.id    Element id (default is randomly generated)
   *  attrs.type  Script type (default: 'text/javascript')
   *
   * The C<onLoad> callback, if provided, will be executed after the script is 
   * loaded.
   *
   * If you want
   */

  this.script = function (attrs, cb) {
    var head = _getHead();
    if (attrs.id && !attrs.text) {
      var elem = ecma.dom.selectElement('SCRIPT#' + attrs.id, head);
      if (elem) {
        if (cb) {
          if (attrs.id in _loaded) {
            if (_loaded[attrs.id]) {
              ecma.lang.callback(cb, ecma.window, [elem]);
            } else {
              _onLoadCallbacks[attrs.id].push(cb);
            }
          }
        }
        return elem;
      }
    }
    if (!attrs.type) attrs.type = 'text/javascript';
    if (!attrs.id) attrs.id = ecma.util.randomId('script');
    var elem = ecma.dom.createElement('script', attrs);
    if (attrs.text) {
      head.appendChild(elem);
      _loaded[attrs.id] = true;
      if (cb) ecma.lang.callback(cb, ecma.window, [elem]);
    } else {
      _loaded[attrs.id] = false;
      var cbList = _onLoadCallbacks[attrs.id];
      if (!cbList) {
        cbList = _onLoadCallbacks[attrs.id] = [];
      }
      if (cb) cbList.push(cb);
      var onLoad = ecma.lang.createCallback(
        _setLoaded, this, [attrs.id]
      );
      if (ecma.dom.browser.isIE) {
        ecma.dom.addEventListener(elem, 'readystatechange', onLoad);
      } else {
        ecma.dom.addEventListener(elem, 'load', onLoad);
      }
      head.appendChild(elem);
    }
    return elem;
  };

  /**
   * @function scripts
   * Same as L<script>, however takes an array of C<attrs>. The callback is
   * executed after all scripts have loaded.
   * @param attrList <Array> See L<script>
   * @param cb <Callback> Executed after scripts load
   * @return elems <Array> DOM script elements
   */

  this.scripts = function (attrList, cb) {
    var result = [];
    var captured = 0;
    function captureLoaded (elem, attrs) {
      if (++captured == attrList.length && cb) {
        ecma.lang.callback(cb, ecma.window, [result]);
      }
    }
    for (var i = 0; i < attrList.length; i++) {
      result.push(_package.script(attrList[i], [captureLoaded]));
    }
    return result;
  };

  /**
   * @function style
   * Append a LINK or STYLE element to the document's HEAD.
   *
   *  var elem = ecma.dom.include.style(attrs);
   *
   * The C<attrs> object must contain either one of these two members:
   *
   *  attrs.text  CSS source code
   *  attrs.href  URI of the stylesheet
   *
   * The element attributes C<attrs> are passed to L<ecma.dom.createElement>.
   * The following attributes will be used if provided, otherwise set:
   *
   *  attrs.id    Element id (default is randomly generated)
   *  attrs.type  Style type (default: 'text/css')
   *  attrs.rel   When C<attrs.href> is provided (default: 'text/css')
   *
   * The element attributes
   * @param attrs Element attributes
   */

  this.style = function (attrs) {
    var elem = attrs.id ? ecma.dom.getElement(attrs.id) : undefined;
    if (elem) return elem;
    if (!attrs.id) attrs.id = ecma.util.randomId('css');
    if (!attrs.type) attrs.type = 'text/css';
    var head = _getHead();
    if (attrs.href) {
      if (!attrs.rel) attrs.rel = 'stylesheet';
      elem = ecma.dom.createElement('link', attrs);
    } else {
      var text = attrs.text;
      delete attrs.text;
      elem = ecma.dom.createElement('style', attrs);
      if (ecma.dom.browser.isIE) {
        elem.styleSheet.cssText = text;
      } else {
        elem.appendChild(ecma.document.createTextNode(text));
      }
    }
    head.appendChild(elem);
    return elem;
  };

});
