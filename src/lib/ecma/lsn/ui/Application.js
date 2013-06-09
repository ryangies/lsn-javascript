/** @namespace lsn */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CView = ecma.lsn.ui.View;

  var proto = ecma.lang.createPrototype(CView);

  /**
   * @class Application
   */

  this.Application = function (rootElem) {
    CView.apply(this, arguments);
  };

  this.Application.prototype = proto;

  proto.createUI = function (rootElem) {
    var nlist = rootElem.getElementsByClassName('ui');
    for (var i = 0, node; node = nlist[i]; i++) {
      if (!node.id) continue;
      this.ui[node.id] = node;
    }
    return this.ui;
  };

  proto.updateUI = function () {};

  proto.destroyUI = function () {};

});
