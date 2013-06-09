/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CCreateDialog = ecma.hubb.ui.CreateDialog;
  var proto = ecma.lang.createPrototype(CCreateDialog);

  /**
   * @class DownloadDialog
   */

  this.DownloadDialog = function () {
    CCreateDialog.apply(this, ['/', '/res/hub/dlg/download.html']);
  };
  this.DownloadDialog.prototype = proto;

  proto.getTitle = function () {
    return 'Fetch a file from the internet';
  };

  proto.onLoad = function () {
    CCreateDialog.prototype.onLoad.apply(this, arguments);
    this.ui.uri = this.dlg.getElementById('uri');
    ecma.dom.addEventListener(this.ui.uri, 'change', this.onChange, this);
  };

  proto.onShow = function () {
    ecma.dom.setValue(this.ui.uri, '');
    CCreateDialog.prototype.onShow.apply(this);
    this.ui.uri.focus();
  };

  proto.onChange = function () {
    var fn = this.getFilename();
    this.setName(fn);
    CCreateDialog.prototype.updateUI.apply(this, arguments);
  };

  proto.isTargetValid = function () {
    if (!this.getFilename()) return false;
    return CCreateDialog.prototype.isTargetValid.apply(this);
  };

  proto.getFilename = function () {
    var value = this.getUri();
    var fn = value.replace(/\\/g, '/');
    var idx = fn.lastIndexOf('/');
    idx = ecma.util.defined(idx) ? idx + 1 : 0;
    fn = fn.substr(idx);
    fn = ecma.window.decodeURIComponent(fn);
    return fn;
  };

  proto.getUri = function () {
    return ecma.dom.getValue(this.ui.uri);
  };

  proto.onOk = function () {
    if (this.isTargetValid()) {
      var addr = this.srcNode.getAddress();
      var name = this.getName();
      var uri = this.getUri();
      ecma.hubb.getInstance().download(addr, name, uri, [this.onComplete, this]);
    }
  };

  proto.onComplete = function (dnode) {
  };

});

