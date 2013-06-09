/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var baseClass = ecma.lsn.Widget;
  var proto = ecma.lang.Methods(baseClass);

  /**
   * @class Dialog
   */

  this.Dialog = function (uri, userOpts) {
    this.id = ecma.util.randomId('dlg_');
    var opts = {
      modal: true,
      modalOpacity: .50
    };
    ecma.util.overlay(opts, userOpts);
    baseClass.apply(this, [uri, opts]);
    this.mask = null;
  };

  this.Dialog.prototype = proto;

  /**
   * @function beforeShow
   */

  proto.beforeShow = function () {
    if (this.sticky && this.zIndex) {
      // Do not reallocate zIndex when sticky
    } else {
      this.zIndex = ecma.lsn.zIndexAlloc();
    }
    if (this.modal) {
      this.mask = new ecma.lsn.Mask();
      this.mask.show({
        'opacity':this.modalOpacity,
        'z-index':this.zIndex - 1
      });
    }
  };

  /**
   * @function onHide
   */

  proto.onHide = function () {
    if (this.modal) {
      this.mask.hide();
      this.mask = null;
    }
    ecma.lsn.zIndexFree();
  };

});
