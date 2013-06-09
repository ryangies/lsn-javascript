/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var proto = {};

  /**
   * @class Element
   */

  this.Element = function () {
    this.uiElems = {root:null};
    this.uiEvents = {};
  };

  this.Element.prototype = proto;

  proto.createElement = function () {
    var args = ecma.util.args(arguments);
    var arg1 = args.shift();
    var parts = arg1.split('_');
    var tag = parts[0];
    var id = parts[1];
    var elem = null;
    if (tag && id) {
      args.unshift(tag);
      elem = this.uiElems[arg1] = ecma.dom.createElement.apply(null, args);
    } else {
      elem = ecma.dom.createElement.apply(null, arguments);
    }
    return elem;
  };

  proto.getRootElement = ecma.lang.createAbstractFunction();

  proto.getElement = function (id) {
    return this.uiElems[id];
  };

  proto.setElement = function (id, elem) {
    return this.uiElems[id] = elem;
  };

  proto.removeElement = function (id) {
    var elem = this.getElement(id);
    if (!elem) return;
    return delete this.uiElems[id];
  };

  function formatEventKey (id, type) {
    return id + '.' + type;
  };

  proto.addEventListener = function (id) {
    var elem = this.getElement(id);
    if (!elem) return;
    var args = ecma.util.args(arguments);
    args[0] = elem;
    var key = formatEventKey(id, args[1]);
    return this.uiEvents[key] = ecma.lang.createObject(ecma.dom.EventListener, args);
  }

  proto.removeEventListener = function (id, type) {
    var elem = this.getElement(id);
    if (!elem) return;
    var key = formatEventKey(id, type);
    this.uiEvents[key].remove();
    return delete this.uiEvents[key];
  }

});
