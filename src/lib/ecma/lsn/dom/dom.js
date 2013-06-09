/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @function getAnchorsByRel
   *
   * DEPRECATED, instead use:
   *
   *  js.dom.selectElements("A[rel=" + name + "]", rootNode);
   */

  this.getAnchorsByRel = function (rootNode, name) {
    var links = ecma.dom.getElementsByTagName(rootNode, 'A');
    var result = [];
    for (var i = 0, node; node = links[i]; i++) {
      var rel = ecma.dom.getAttribute(node, 'rel');
      if (rel == name) {
        result.push(node);
      }
    }
    return result;
  };

  /**
   * @function findNode
   */

  this.findNode = function (node, cb) {
    if (!ecma.dom.node.isElement(node)) return null;
    var n = node.firstChild;
    while (n) {
      if (ecma.lang.callback(cb, null, [n])) return n;
      var r = ecma.dom.findNode(n, cb);
      if (r) return r;
      n = n.nextSibling;
    }
    return null;
  };

});
