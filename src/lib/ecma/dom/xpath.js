/**
 * @namespace dom
 */

ECMAScript.Extend('dom', function (ecma) {

  /**
   * @function getXPath
   */

  this.getXPath = function (elem) {
    elem = ecma.dom.getElement(elem);
    var result = [''];
    while (elem && ecma.dom.node.isElement(elem)) {
      var i = ecma.dom.getChildIndex(elem);
      var name = elem.tagName.toLowerCase();
      if (i > 0) name += '[' + (i + 1) + ']';
      result.unshift(name);
      elem = elem.parentNode;
    }
    return result.join('/');
  }

  /**
   * @function getChildIndex
   */

  this.getChildIndex = function (elem) {
    var result = 0;
    for (var node = elem.previousSibling; node; node = node.previousSibling) {
      if (ecma.dom.node.isElement(node) && (node.tagName == elem.tagName)) {
        result++;
      }
    }
    return result;
  }

});
