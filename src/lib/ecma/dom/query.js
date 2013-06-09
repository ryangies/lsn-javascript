/** @namespace dom */


/**
 * EXPERIMENTAL
 *
 * This method uses CSS to set a style property, then recurse elements
 * to identify if the property is set.  The problem of course is that that
 * property may be used.  It would be ideal iff we could make up some
 * bogus property...
 */


ECMAScript.Extend('dom', function (ecma) {

  /**
   * @function query
   * Recursive fetch nodes which match the given selector.
   *
   *  var list = ecma.dom.query(pElem, selector);
   *  var list = ecma.dom.query(pElem, selector1, selector2, ..., selectorN);
   *
   * Where:
   *
   *  @param list <Array> List of matching nodes
   *  @param pElem <Element|ID> Parent (containing) element
   *  @param selector <String> Selector specification
   *
   * Examples
   *
   *  tbody th a#mylink.lnk[href$="html"][onclick="foo"]:first-child
   *
   */

  var _css = new ecma.dom.StyleSheet();
  var _cssPropKey = 'z-index';
  var _cssPropVal = '1';
  var _props = {};
  _props[_cssPropKey] = _cssPropVal;

  this.query = function (selector, pElem) {
    var result = [];
    var groups = selector.split(',');
    pElem = pElem ? ecma.dom.getElement(pElem) : ecma.dom.getBody();
    for (var i = 0, group; i < groups.length; i++) {
      var group = groups[i];
      var rule = _css.createRule(group, _props);
      _recurseNodes(pElem, result);
      _css.deleteRule(rule);
    }
    return result;
  };

  function _recurseNodes (elem, result) {
    if (elem.hasChildNodes()) {
      for (var i = 0, node; node = elem.childNodes[i]; i++) {
        if (ecma.dom.getStyle(node, _cssPropKey) == _cssPropVal) result.push(node);
        _recurseNodes(node, result);
      }
    }
  }

});
