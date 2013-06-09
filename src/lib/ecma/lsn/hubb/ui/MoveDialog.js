/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CTargetDialog = ecma.hubb.ui.TargetDialog;
  var proto = ecma.lang.createPrototype(CTargetDialog);

  /**
   * @class MoveDialog
   */

  this.MoveDialog = function () {
    CTargetDialog.apply(this, ['/', '/res/hub/dlg/move.html']);
  };
  this.MoveDialog.prototype = proto;

  proto.onOk = function () {
    if (this.isTargetValid()) {
      var srcAddr = this.srcNode.getAddress();
      var destAddr = this.getAddress();
      ecma.hubb.getInstance().move(srcAddr, destAddr);
    }
  };

});

