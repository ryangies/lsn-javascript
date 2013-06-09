ECMAScript.Extend('lsn', function (ecma) {

  _impl = {}; // implementation classes

  /* ======================================================================== */

  this.ContentController = function () {
    this.impl =
      ecma.dom.browser.isIE       ? new _impl.IE() :
      ecma.dom.browser.isGecko    ? new _impl.Gecko() : new _impl.Gecko();
    if (!this.impl) throw new Error('no ContentController implementation for this browser');
  };

  this.ContentController.prototype.attach = function (elem) {
    elem = ecma.dom.getElement(elem);
    return this.impl.attach.apply(this.impl, [elem]);
  };

  this.ContentController.prototype.detach = function () {
    return this.impl.detach.apply(this.impl, []);
  };

  this.ContentController.prototype.insertHTML = function () {
    return this.impl.insertHTML.apply(this.impl, arguments);
  };

  this.ContentController.prototype.getFocusElement = function () {
    return this.impl.getFocusElement.apply(this.impl, arguments);
  };

  this.ContentController.prototype.insertElement = function () {
    return this.impl.insertElement.apply(this.impl, arguments);
  };

  this.ContentController.prototype.selectElement = function () {
    return this.impl.selectElement.apply(this.impl, arguments);
  };

  this.ContentController.prototype.focusBefore = function () {
    return this.impl.focusBefore.apply(this.impl, arguments);
  };

  this.ContentController.prototype.focusAfter = function () {
    return this.impl.focusAfter.apply(this.impl, arguments);
  };

  this.ContentController.prototype.exec = function () {
    return this.impl.exec.apply(this.impl, arguments);
  };

  this.ContentController.prototype.toggle = function (tagName) {
    return this.impl.toggle.apply(this.impl, arguments);
  };

  /* ======================================================================== */

  _impl.Gecko = function () {
  };

  _impl.Gecko.prototype = {

    attach: function (elem) {
      this.target = elem;
      this.exec('useCSS', true); // which means no, don't use css
    },

    detach: function () {
      this.target = undefined;
    },

    getFocusElement: function () {
      var sel = this.getSelection();
      var range = sel.getRangeAt(0);
      var elem = range.commonAncestorContainer;
      while (elem && elem.nodeType != Node.ELEMENT_NODE) {
        elem = elem.parentNode;
      }
      return elem;
    },

    /**
     * @param elem to insert
     * @param focus will give the inserted element the focus
     */

    insertElement: function (elem) {
      var sel = this.getSelection();
      if (false == sel.isCollapsed) {
        sel.deleteFromDocument();
        sel = this.getSelection();
      }
      if (sel.isCollapsed) {
        var nFocus = sel.focusNode;
        var focusOffset = sel.focusOffset;
        switch (nFocus.nodeType) {
          case Node.ELEMENT_NODE:
            var nCurr = focusOffset > 0 ? nFocus.childNodes[focusOffset - 1] : nFocus;
            if (nCurr === this.target) {
              if (nCurr.childNodes.length > 0) {
                nCurr.insertBefore(elem, nCurr.childNodes[0]);
              } else {
                nCurr.appendChild(elem);
              }
            } else {
              ecma.dom.insertChildrenAfter(nCurr, [elem]);
            }
            break;
          case Node.TEXT_NODE:
            var a = nFocus.nodeValue.substr(0, focusOffset);
            var b = nFocus.nodeValue.substr(focusOffset);
            var nA = ecma.dom.createElement('#text', {'nodeValue':a});
            var nB = ecma.dom.createElement('#text', {'nodeValue':b});
            ecma.dom.insertChildrenBefore(nFocus, [nA, elem, nB]);
            nFocus.parentNode.removeChild(nFocus);
            break;
          default:
            throw new Error('no implementation for selected nodeType');
        }
        this.focusAfter(elem);
      }
    },

    selectElement: function (elem) {
      var sel = this.getSelection();
      sel.removeAllRanges();
      var range = ecma.document.createRange();
      range.selectNode(elem);
      sel.addRange(range);
      return sel;
    },

    focusBefore: function (elem) {
      sel = this.selectElement(elem);
      sel.collapseToStart();
    },

    focusAfter: function (elem) {
      sel = this.selectElement(elem);
      sel.collapseToEnd();
    },

    insertHTML: function (html) {
      this.exec('insertHTML', html);
    },

    exec: function (cmd, args) {
      ecma.document.execCommand(cmd, false, args);
    },

    toggle: function (tagName) {
    },

    getSelection: function () {
      var sel = ecma.window.getSelection();
      if (!sel.anchorNode) throw new Error('target does not have focus');
      return sel;
    },

    setSelection: function () {
    }

  };

  /* ======================================================================== */

  _impl.IE = function () {
  };

  _impl.IE.prototype = {

    attach: function (elem) {
      this.target = elem;
    },

    detach: function () {
      this.target = undefined;
    },

    getFocusElement: function () {
      var sel = this.getSelection();
      var range = sel.createRange();
      return sel.type == 'Control' ? range.item(0) : range.parentElement();
    },

    insertElement: function (elem) {
      var sel = this.getSelection();
      var tmp = this._insertTemp();
      this.replaceElement(tmp, elem);
    },

    replaceElement: function (eOld, eNew) {
      eOld.appendChild(eNew);
      eOld.removeNode();
    },

    _insertTemp: function() {
      var id = ecma.util.randomId();
      var html = "<span id='" + id + "'></span>";
      this.getRange().pasteHTML(html);
      var elem = ecma.dom.getElement(id);
      return elem;
    },

    selectElement: function (elem) {
      var range = ecma.dom.getBody().createControlRange();
      range.addElement(elem);
      range.select();
    },

    focusBefore: function (elem) {
      this.selectElement(elem);
    },

    focusAfter: function (elem) {
      this.selectElement(elem);
    },


    insertHTML: function (html) {
      this.getRange().pasteHTML(html);
    },

    exec: function (cmd, args) {
      ecma.document.execCommand(cmd, args ? false : true, args);
    },

    toggle: function (tagName) {
      var sel = ecma.document.selection;
      var ranges = sel.createRangeCollection();
      for (var i = 0; i < ranges.length; i++) {
        var textRange = ranges.item(i);
        var html = textRange.htmlText;
        if (html) {
          var re = new RegExp('\\s*<' + tagName + '>');
          if (html.match(re, 'g')) {
          } else {
          }
          textRange.pasteHTML(html);
        }
      }
    },

    getSelection: function () {
      var sel = ecma.document.selection;
//    if (sel.type == 'None') throw new Error('target does not have focus');
      return sel;
    },

    getRange: function() {
      return this.getSelection().createRange();
    }

  };

});
