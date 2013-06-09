/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CTargetDialog = ecma.hubb.ui.TargetDialog;
  var proto = ecma.lang.createPrototype(CTargetDialog);

  /**
   * @class CopyDialog
   */

  this.CopyDialog = function () {
    CTargetDialog.apply(this, ['/', '/res/hub/dlg/copy.html']);
  };
  this.CopyDialog.prototype = proto;

  proto.onOk = function () {
    if (this.isTargetValid()) {
      var srcAddr = this.srcNode.getAddress();
      var destAddr = this.getAddress();
      ecma.hubb.getInstance().copy(srcAddr, destAddr);
    }
  };

});
