/** @namespace lsn */

ECMAScript.Extend('lsn', function (ecma) {

  var _css = null;

  /**
   * @function initDialogStyles
   */

  this.initDialogStyles = function () {
    if (_css) return;
    _css = new ecma.dom.StyleSheet();
    _css.createRule('.dlghidden', {
      'visibility':'hidden',
      'z-index':'-1',
      'position':'absolute',
      'left':'-1000em'
    });
  };

  /**
   * @function includeHead
   * Insert CSS and JS specified in response to an L<ecma.lsn.Request>
   */

  this.includeHead = function () {
    ecma.lsn.includeHeadCSS.apply(this, arguments);
    ecma.lsn.includeHeadJS.apply(this, arguments);
  };

  /**
   * @function includeHeadCSS
   */

  this.includeHeadCSS = function(head, id, caller) {
    if (head) {
      var links = head.get('links/css');
      if (links) {
        links.iterate(function (k,v) {
          ecma.dom.include.style({'href':v});
        });
      }
      var text = head.get('css');
      if (text) {
        ecma.dom.include.style({'text':text});
      }
    }
  };

  /**
   * @function includeHeadJS
   * SCRIPT elements added to the DOM are not controlled by the browser's
   * document parser.  Thus the load order is not maintained.  This routine
   * will load SCRIPT elements in order, waiting for each to complete
   * before proceeding to the next.
   *
   * When all SCRIPT elements have been loaded the optional callback parameter
   * is run under the scope of the caller parameter.
   */

  this.includeHeadJS = function(head, id, caller, cb) {
    if (head) {
      var hasLoaded = false;
      // Links - Remote script inclusion
      var links = head.get('links/js');
      if (links) {
        var list = links.values();
        var includeNext;
        includeNext = function () {
          if (list.length) {
            var uri = new ecma.http.Location(list.shift());
//          uri.addParameter('uniq', new Date().getTime());
            ecma.dom.include.script({'src':uri.getHref()}, includeNext);
          } else {
            hasLoaded = true;
          }
        }
        includeNext();
      } else {
        hasLoaded = true;
      }
      // Global JavaScript
      var text = head.get('js');
      if (text) {
        ecma.dom.include.script({'text':text});
      }
      // Blocks - JavaScript contained within anonymous closure
      var blocks = head.get('blocks/js');
      if (blocks) {
        blocks.iterate(function (i, block) {
          ecma.dom.include.script({'text': block});
        });
      }
      // Events - Shorthand for binding javascript to widget events
      var events = head.get('events/js');
      if (events) {
        events.iterate(function (target, events) {
          events.iterate(function (idx, kvpair) {
            // Bind global variables to this context
            var js = ecma;
            var window = ecma.window;
            var document = ecma.document;
            var evtFunc = ecma.lang.Callback(function () {
              eval(kvpair.get('value'));
            }, caller);
            if (target == 'dialog' || target == 'widget') {
              if (caller) {
                caller.includeEvent(kvpair.get('key'), evtFunc);
              }
            } else {
              ecma.dom.addEventListener(eval(target), kvpair.get('key'), evtFunc);
            }
          });
        });
      }
      // Now we wait for the browser to complete loading scripts
      if (cb) {
        ecma.dom.waitUntil(cb, function () {return hasLoaded;}, 10, caller);
      }
    } else {
      if (cb) cb.apply(caller);
    }
  };

  /**
   * @class Widget
   * A response comprised of HTML, JS and CSS which is not a full document.
   *
   * @param uri       <String>    Location of widget resource
   * @param options   <Object>    Options
   *
   * Where C<options> are:
   *
   *  container       <HTMLElement> Append the widget to this container.
   *                                Default is the document body.
   *
   *  refetch         <boolean>   When the widget is shown after it has been
   *                              hidden, it will be refetched from the server
   *                              if this is true.  Default is false.
   *
   * Example:
   *
   *  var w = new js.lsn.Widget('/my.html', {container: 'mydiv'});
   *  w.show({param:'value'});
   */

  this.Widget = function (uri, options) {
    ecma.lsn.initDialogStyles();
    if (!this.id) this.id = ecma.util.randomId('widget_');
    this.request = new ecma.lsn.Request(uri, {
      'onSuccess': ecma.lang.Callback(this._onSuccess, this),
      'onInternalServerError': ecma.lang.Callback(this._onFailure, this)
    });
    this.container = undefined;
    this.handleKeypress = {};
    this.sticky = false; // prevents dom detatch when hiding
    this.nodeStyles = []; // for preserving between hide and show
    this.refetch = true;
    this.events = {};
    this.includeEvents = {};
    this.props = {};
    this.jsLoaded = false;
    this.hidden = false;
    for (var k in options) {
      this.setOption(k, options[k]);
    }
    this.reset();
  };

  this.Widget.prototype = {

    reset: function() {
      this.nodes = null;
      this.values = {};
      this.btn_events = [];
      this.includeEvents = {};
      this._stopEvent = {};
      this._eventName = [];
      this.hasLoaded = false;
    },

    setOption: function(key, value) {
      if (key.match(/^on[A-Z]/)) {
        this.addEvent(key, value);
      } else {
        this[key] = value;
      }
    },

    relayEvent: function(event, name) {
      ecma.dom.stopEvent(event);
      this.doEvent(name);
    },

    addEvent: function(name, func) {
      name = name.replace(/^on/, '');
      name = name.toLowerCase();
      if(!this.events[name]) this.events[name] = new Array();
      this.events[name].push(func);
    },

    includeEvent: function(name, func) {
      name = name.replace(/^on/, '');
      name = name.toLowerCase();
      if(!this.includeEvents[name]) this.includeEvents[name] = new Array();
      this.includeEvents[name].push(func);
    },

    stopEvent: function () {
      if (!this._eventName.length) return;
      var name = this._eventName[this._eventName.length - 1];
      this._stopEvent[name] = true;
    },

    _isStopped: function (name) {
      return this._stopEvent[name];
    },

    _beginEvent: function (name) {
      this._eventName.push(name);
    },

    _endEvent: function (name) {
      delete this._stopEvent[name];
      this._eventName.pop();
    },

    doEvent: function(name) {
      this._beginEvent(name);
      //ecma.console.log('doEvent', name);
      if (this._isStopped(name)) return this._endEvent(name);
      /* Fire events defined by the widget */
      if (this.includeEvents[name]) {
        for (var i = 0; i < this.includeEvents[name].length; i++) {
          this.includeEvents[name][i].apply(this);
          if (this._isStopped(name)) return this._endEvent(name);
        }
      }
      /* Fire events defined by the caller */
      if (this.events[name]) {
        for (var i = 0; i < this.events[name].length; i++) {
          var cb = this.events[name][i];
          ecma.lang.callback(cb, this, [this]);
          if (this._isStopped(name)) return this._endEvent(name);
        }
      }
      /* Internal event handling */
      if (name == 'init') {
        // The dialog is ready after it is shown. The ready event must not 
        // happen until the the dialog's JS and CSS have been processed *and* 
        // the elements which have been added to the DOM are ready.
        ecma.dom.waitUntil(this._onInit, this._jsLoaded, 10, this, ['ready']);
      }
      if (name == 'ok' || name == 'cancel') {
        this.hide();
      }
      if (name == 'hide') {
        this.onHide();
      }
      if (name == 'load') {
        this.hasLoaded = true;
      }
      this._endEvent(name);
    },

    show: function(params) {
      this.params = params ? params : {};
      this.beforeShow();
      if (this.nodes) {
        if (this.refetch) {
          this.destroy();
          this.request.submit();
        } else {
          this._enableUI();
          this.doEvent('init');
        }
      } else {
        /* Fetch the dialog from the server */
        this.request.submit();
      }
    },

    getElementById: function (id) {
      var elem = null;
      for (var i = 0, node; node = this.nodes[i]; i++) {
        elem = ecma.dom.getDescendantById(node, id);
        if (elem) break;
      }
      return elem;
    },

    beforeShow:function(){},

    _onFailure: function(xhr) {
      this.onHide();
    },

    _onSuccess: function(r) {
      this.doc = r.responseHash;
      var tmpDiv = ecma.dom.createElement('div', {'innerHTML': this.doc.get('body')});
      this.nodes = ecma.util.args(tmpDiv.childNodes);
      this.nodes.push(ecma.dom.createElement('noscript', {id:this.id+'_dom_ready'}));
      this._appendNodes();
      this._includeRes();
      this.doEvent('init');
    },

    _appendNodes: function () {
      var ce = ecma.dom.getElement(this.container || ecma.dom.getBody());
      for (var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        if (!node.style) {
          this.nodes.splice(i--, 1);
          continue;
        }
        if (this.zIndex) {
          ecma.dom.setStyle(node, 'z-index', this.zIndex);
        }
        ce.appendChild(node);
      }
      if (this.nodes.length == 1) { // 1 b/c the _dom_ready elem is appended
        throw new Error('No element nodes found');
      }
    },

    _includeRes: function () {
      ecma.lsn.includeHeadCSS(this.doc.get('head'), this.id, this);
      ecma.dom.waitUntil(this._includeJS, this._domLoaded, 10, this);
    },

    _includeJS: function () {
      this.jsLoaded = false;
      ecma.lsn.includeHeadJS(this.doc.get('head'), this.id, this, function () {
        this.jsLoaded = true;
      });
    },

    _domLoaded: function () {
      return ecma.dom.getElement(this.id+'_dom_ready') ? true : false;
    },

    _jsLoaded: function () {
      return this.jsLoaded;
    },

    _onInit: function () {
      if (!this.hasLoaded) this.doEvent('load');
      this.doEvent('show');
      this.hidden = false;
      this.doEvent('ready');
    },

    _removeUI: function() {
      if (this.nodes) {
        for (var i = 0; i < this.nodes.length; i++) {
          ecma.dom.removeElement(this.nodes[i]);
        }
      }
    },

    _disableUI: function () {
      if (!this.sticky) return this._removeUI();
      if (this.nodes) {
        for (var i = 0; i < this.nodes.length; i++) {
          this.nodeStyles[i] = this._hideElement(this.nodes[i]);
        }
      }
    },

    _enableUI: function () {
      if (!this.sticky) return this._appendNodes();
      if (this.nodes) {
        for (var i = 0; i < this.nodes.length; i++) {
          ecma.dom.setStyles(this.nodes[i], this.nodeStyles[i]);
        }
        this.nodeStyles = [];
      }
    },

    _hideElement: function (elem) {
      var bak = {
        'visibility': ecma.dom.getStyle(elem, 'visibility'),
        'z-index': ecma.dom.getStyle(elem, 'z-index'),
        'position': ecma.dom.getStyle(elem, 'position'),
        'left': ecma.dom.getStyle(elem, 'left')
      };
      ecma.dom.setStyles(elem, {
        'visibility':'hidden',
        'z-index':'-1',
        'position':'absolute',
        'left':'-1000em'
      });
      return bak;
    },

    _showElement: function () {
    },

    hide: function() {
      if (this.hidden) return;
      this.doEvent('hide');
      this._disableUI();
      this.hidden = true;
    },

    onHide:function(){},

    destroy: function() {
      this.hide();
      this._removeUI();
      this.doEvent('destroy');
      this.reset();
    }

  };

});
