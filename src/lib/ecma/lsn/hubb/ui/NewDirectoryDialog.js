/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CCreateDialog = ecma.hubb.ui.CreateDialog;
  var proto = ecma.lang.createPrototype(CCreateDialog);

  /**
   * @class NewDirectoryDialog
   */

  this.NewDirectoryDialog = function () {
    CCreateDialog.apply(this, ['/', '/res/hub/dlg/new.html']);
  };
  this.NewDirectoryDialog.prototype = proto;

  proto.onOk = function () {
    if (this.isTargetValid()) {
      var addr = this.srcNode.getAddress();
      var name = this.getName();
      ecma.hubb.getInstance().create(addr, name, 'directory');
    }
  };

  proto.getTitle = function () {
    return 'Create a new folder';
  };

});
