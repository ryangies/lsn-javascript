/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  var proto = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @class View
   */

  this.View = function (rootElem) {
    CActionDispatcher.apply(this);
    this.ui = new Object();
    this.rootElem = rootElem;
  };

  this.View.prototype = proto;

  proto.createUI = function () {
    return this;
  };

  proto.updateUI = function () {
    return this;
  };

  proto.destroyUI = function () {
    return this;
  };

  proto.attachUI = function (elem) {
    if (!elem) elem = this.rootElem;
    if (!elem) throw new Error('Missing element');
    var nlist = elem.getElementsByClassName('ui');
    for (var i = 0, node; node = nlist[i]; i++) {
      if (!node.id) continue;
      this.ui[node.id] = node;
    }
    return this;
  };

});
