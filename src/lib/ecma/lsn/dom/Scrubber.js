/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * ACCEPT_TAGS - Tag names of acceptable elements.
   *
   * Any element with a tag name which is NOT in this list will be removed (and 
   * so will its children).
   *
   * This of course is DOCTYPE specific, however the below list is HTML 4.01.
   */

  var ACCEPT_TAGS = [
    'A',
    'ABBR',
    'ACRONYM',
    'ADDRESS',
    'B',
    'BDO',
    'BIG',
    'BLOCKQUOTE',
    'BR',
    'BUTTON',
    'CAPTION',
    'CENTER',
    'CITE',
    'CODE',
    'COL',
    'COLGROUP',
    'DD',
    'DEL',
    'DFN',
    'DIV',
    'DL',
    'DT',
    'EM',
    'FONT',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'I',
    'IMG',
    'INS',
    'KBD',
    'LABEL',
    'LI',
    'OL',
    'OPTGROUP',
    'OPTION',
    'P',
    'PRE',
    'Q',
    'S',
    'SAMP',
    'SMALL',
    'SPAN',
    'STRIKE',
    'STRONG',
    'SUB',
    'SUP',
    'TABLE',
    'TBODY',
    'TD',
    'TFOOT',
    'TH',
    'THEAD',
    'TR',
    'TT',
    'U',
    'UL',
    'VAR'
  ];

  /**
   * EMPTY_TAGS - Tag names of elements which are allowed to not have children.
   *
   * Any element which is not in this list, and has no child nodes will be
   * removed.
   */

  var EMPTY_TAGS = [
    'BR',
    'IMG',
    'INPUT',
    'TBODY',
    'TD',
    'TFOOT',
    'TH',
    'THEAD',
    'TR',
  ];

  /**
   * REMOVE_TAGS - Tag names which should not be used.
   *
   * Any element with a tag name which is in this list will be removed, however
   * its children will remain.  Note that any tag name in this list must first
   * be accepted (see ACCEPT_TAGS).
   */

  var REMOVE_TAGS = [
    'FONT',
    'SPAN',
    'LABEL'
  ];

  /**
   * REMAP_TAG_MAP - Tag names which should be remapped.
   *
   * Any element with a tag name which is a key in this hash will be replaced
   * with an element of the corresponding value.  Child nodes will be adopted.
   */

  var REMAP_TAG_MAP = {
    'STRONG': 'B',
    'EM': 'I'
  };

  var REMAP_TAGS = [];
  for (var tag in REMAP_TAG_MAP) {
    REMAP_TAGS.push(tag);
  }

  /**
   * PRESERVE_WS_TAGS - Tag names of elements where whitespace matters.
   *
   * The nodeValue of any text node within an element whose tag name is not in 
   * this list will undergo the substition s/\s+/ /g.
   *
   * In other words, white-space is removed from inside all elements unless 
   * they are listed here.
   */

  var PRESERVE_WS_TAGS = [
    'CODE',
    'PRE',
    'TEXTAREA',
    'TT'
  ];

  /**
   * DENY_INBREEDING - Tag names of elements which should not be descendants of 
   * themselves.
   */

  var DENY_INBREEDING = [
    'A',
    'ABBR',
    'ACRONYM',
    'ADDRESS',
    'B',
    'BDO',
    'BIG',
    'BR',
    'BUTTON',
    'CAPTION',
    'CENTER',
    'CITE',
    'CODE',
    'DEL',
    'DFN',
    'EM',
    'FONT',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'I',
    'IMG',
    'INS',
    'KBD',
    'LABEL',
    'OPTION',
    'P',
    'PRE',
    'Q',
    'S',
    'SAMP',
    'SMALL',
    'STRIKE',
    'STRONG',
    'SUB',
    'SUP',
    'TT',
    'U',
    'VAR'
  ];

  /**
   * ACCEPT_STYLES - Inline style attributes which will be preserved.
   *
   * Any style which is not in this list will be removed.
   */

  var ACCEPT_STYLES = [
//  'color',
    'align',
    'clear'
  ];

  /**
   * DENY_ATTRS - Element attributes which will be removed.
   */

  var DENY_ATTRS = [
//  'id',
    'class'
  ];

  this.Scrubber = function (js) {
    this.js = js;
  }

  var Scrubber = this.Scrubber.prototype = ecma.lang.createPrototype();

  Scrubber.scrub = function (elem) {
    return this.collapse(this.clean(elem));
  };

  Scrubber.clean = function (elem) {
    var node = elem.firstChild;
    while (node) {
      var next = node.nextSibling;
      switch (node.nodeType) {
        case ecma.dom.constants.ELEMENT_NODE:
          if (!ecma.util.grep(node.tagName, ACCEPT_TAGS)) {
            // Remove nodes which we don't accept
            ///ecma.console.log('removeChild', node.tagName, '(do not accept)');
            elem.removeChild(node);
            break;
          }
          if (!node.childNodes.length && !ecma.util.grep(node.tagName, EMPTY_TAGS)) {
            // Remove empty nodes
            ///ecma.console.log('removeChild', node.tagName, '(is empty and content is required)');
            elem.removeChild(node);
            break;
          }
          if (ecma.util.grep(node.tagName, REMOVE_TAGS)) {
            // Remove node wrappers
            next = node.firstChild;
            this.js.dom.removeElementOrphanChildren(node);
            ///ecma.console.log('removeChild', node.tagName, '(remove this wrapper)');
            break;
          }
          if (ecma.util.grep(node.tagName, REMAP_TAGS)) {
            var newTag = REMAP_TAG_MAP[node.tagName];
            var newNode = this.js.dom.createElement(newTag);
            this.js.dom.insertAfter(newNode, node);
            this.js.dom.appendChildren(newNode, node.childNodes);
            this.js.dom.removeElement(node);
            node = newNode;
          }
          // Scrub children
          this.clean(node);
          // Remove attributes
          for (var i = 0, attr; attr = DENY_ATTRS[i]; i++) {
            this.js.dom.removeAttribute(node, attr);
          }
          // Scrub styles
          this.scrubStyles(node);
          break;
        case ecma.dom.constants.TEXT_NODE:
/*
 * TODO - Only when prev/next siblings are BLOCK level elements. Because for 
 * instnace, the space matters here:
 *
 *        <b>Hello</b> <i>World</i>
 *
          if (node.nodeValue.match(/^\s*$/)
              && (node === elem.firstChild || ecma.dom.node.isElement(node.previousSibling))
              && (node === elem.lastChild || ecma.dom.node.isElement(node.nextSibling))) {
            // Remove ws nodes between elements
            ///ecma.console.log('removeChild', '#text', '(ws between elems)');
            this.js.dom.removeElement(node);
            break;
          }
*/
          if (this.wsMatters(node)) {
            // Retain node as is
            break;
          }
          // Condense ws inside text nodes
          node.nodeValue = node.nodeValue.replace(/\s+/g, ' ');
          if (node.nodeValue) {
            // Retain nodes with content
            break;
          }
        default:
          // Remove nodes which didn't pass the previous checks
          ///ecma.console.log('removeChild', node.tagName, '(did not pass)');
          elem.removeChild(node);
      }
      node = next;
    }
    return elem;
  };

  Scrubber.scrubStyles = function (elem) {
    var styles = {};
    for (var i = 0, name; name = ACCEPT_STYLES[i]; i++) {
      var value = elem.style[name];
      if (ecma.util.defined(value)) {
        styles[name] = value;
      }
    }
    var styleAttr = this.js.dom.getAttribute(elem, 'style');
    this.js.dom.removeAttribute(elem, 'style');
    for (var name in styles) {
      var value = styles[name];
      if (value || value == '0') {
        this.js.dom.setStyle(elem, name, styles[name]);
      }
    }
    var styleAttr2 = this.js.dom.getAttribute(elem, 'style');
    if (styleAttr != styleAttr2) {
      ///ecma.console.log('scrubStyles', '"'+styleAttr+'"', '-->', '"'+styleAttr2+'"');
    }
  };

  Scrubber.wsMatters = function (node) {
    if (ecma.dom.node.isElement(node.previousSibling) ||
        ecma.dom.node.isElement(node.nextSibling)) {
      // e.g., <p><b>bold</b> <i>italic</i></p>
      return true;
    }
    var pNode = node.parentNode;
    while (pNode) {
      if (ecma.util.grep(pNode.tagName, PRESERVE_WS_TAGS)) return true;
      if (pNode.parentNode === pNode) break;
      pNode = pNode.parentNode;
    }
    return false;
  };

  Scrubber.collapse = function (elem, stack) {
    if (!stack) stack = new this.NodeStack();
    stack.push(elem);
    var node = elem.firstChild;
    while (node) {
      var next = node.nextSibling;
      if (stack.isAllowed(node)) {
        this.collapse(node, stack);
      } else {
        ///ecma.console.log('collapse', stack.toString(), node.tagName);
        var referenceNode = elem.nextSibling;
        if (referenceNode) {
          while (node) {
            next = node.nextSibling;
            js.dom.insertBefore(node, referenceNode);
            node = next;
          }
        } else {
          referenceNode = elem;
          while (node) {
            next = node.nextSibling;
            js.dom.insertAfter(node, referenceNode);
            referenceNode = node;
            node = next;
          }
        }
        break;
      }
      node = next;
    }
    stack.pop();
    return elem;
  };

  /**
   * @class NodeStack
   */

  Scrubber.NodeStack = function () {
    this.stack = [];
  };

  var NodeStack = Scrubber.NodeStack.prototype = ecma.lang.createPrototype();

  NodeStack.push = function (elem) {
    return this.stack.push(elem);
  };

  NodeStack.pop = function () {
    return this.stack.pop();
  };

  NodeStack.toString = function () {
    var tagNames = [];
    for (var i = 0, node; node = this.stack[i]; i++) {
      switch (node.nodeType) {
        case ecma.dom.constants.ELEMENT_NODE:
          tagNames.push(node.tagName);
          break;
        case ecma.dom.constants.TEXT_NODE:
          tagNames.push('#TEXT');
          break;
        default:
          tagNames.push('#OTHER');
      }
    }
    return tagNames.join('>');
  };

  NodeStack.isAllowed = function (child) {
    for (var i = 0, node; node = this.stack[i]; i++) {
      if (!ecma.dom.node.isElement(node)) continue;
      if (this.canContain(node, child)) continue;
      return false;
    }
    return true;
  };

  NodeStack.canContain = function (node, child) {
    return node.tagName == child.tagName
      && ecma.util.grep(node.tagName, DENY_INBREEDING) ? false : true
  };

});
