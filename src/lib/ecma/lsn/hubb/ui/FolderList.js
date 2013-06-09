/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CTreeView = ecma.hubb.ui.TreeView;

  /**
   * @class FolderList
   */

  this.FolderList = function () {
    CTreeView.apply(this, arguments);
  };

  var proto = this.FolderList.prototype = ecma.lang.createPrototype(CTreeView);

  proto.canDisplay = function (dnode) {
    return dnode.isDirectory();
  };

});

