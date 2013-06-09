/**
 * Candidate functions for dom namespace.
 */

ECMAScript.Extend('dom', function (ecma) {

  this.getAnchorsByRel = function (name) {
    var rootNode = ecma.dom.getBody();
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

  this.getScrollableParent = function (elem) {
    elem = elem.parentNode;
    var elemScroll = null;
    var body = ecma.dom.getBody();
    while (!elemScroll && elem) {
      var overflow = ecma.dom.getStyle(elem, 'overflow');
      if (overflow && overflow.match(/auto|scroll/i)) {
        elemScroll = elem;
      } else {
        elem = elem == body ? null : elem.parentNode;
      }
    }
    return elemScroll || body;
  };

  this.scrollTo = function (elem) {
    var se = ecma.dom.getScrollableParent(elem); // scroll elem
    var sh = ecma.dom.getHeight(se); // scroll height
    var st = se.scrollTop; // scroll top
    var tt = ecma.dom.getTop(elem) - ecma.dom.getTop(se); // target top
    var tb = ecma.dom.getBottom(elem) - ecma.dom.getTop(se); // target bottom
    if (tb > (st + sh) || (tt < st)) {
      se.scrollTop = ecma.util.asInt(tt - (sh/2));
    }
  };

});
