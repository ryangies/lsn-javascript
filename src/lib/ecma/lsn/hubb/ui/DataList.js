/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CTreeView = ecma.hubb.ui.TreeView;

  /**
   * @class DataList
   */

  this.DataList = function () {
    CTreeView.apply(this, arguments);
  };

  var proto = this.DataList.prototype = ecma.lang.createPrototype(CTreeView);

  proto.canDisplay = function (dnode) {
    return dnode.isDirectory() || dnode.isDataContainer();
  };

  proto.onClick = function (event, tnode) {
    if (tnode.data.isDataContainer()) {
      CTreeView.prototype.onClick.apply(this, arguments);
    } else {
      ecma.dom.stopEvent(event);
    }
  };

});


