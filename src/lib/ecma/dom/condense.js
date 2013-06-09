/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var PRESERVE_WS_TAGS = [
    'CODE',
    'PRE',
    'TEXTAREA',
    'TT'
  ];

  function _wsMatters (node) {
    var pNode = node.parentNode;
    while (pNode) {
      if (ecma.util.grep(pNode.tagName, PRESERVE_WS_TAGS)) return true;
      if (pNode.parentNode === pNode) break;
      pNode = pNode.parentNode;
    }
    return false;
  }

  /**
   * @function condense
   */

  this.condense = function (elem) {
    var node = elem.firstChild;
    while (node) {
      var next = node.nextSibling;
      switch (node.nodeType) {
        case ecma.dom.constants.ELEMENT_NODE:
          ecma.dom.condense(node); // recurse
          break;
        case ecma.dom.constants.TEXT_NODE:
          if (node.nodeValue.match(/^\s*$/)
              && (node === elem.firstChild || ecma.dom.node.isElement(node.previousSibling))
              && (node === elem.lastChild || ecma.dom.node.isElement(node.nextSibling))) {
            // Remove ws nodes between elements
            ecma.dom.removeElement(node);
            break;
          }
          if (_wsMatters(node)) {
            // Retain node as is
            break;
          }
          // Condense ws inside text nodes
          node.nodeValue = node.nodeValue.replace(/\s+/g, ' ');
          if (node.nodeValue) {
            // Retain nodes with content
            break;
          }
      }
      node = next;
    }
    return elem;
  };

});
