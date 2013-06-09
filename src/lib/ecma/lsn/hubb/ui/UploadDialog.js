/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CCreateDialog = ecma.hubb.ui.CreateDialog;
  var proto = ecma.lang.createPrototype(CCreateDialog);

  /**
   * @class UploadDialog
   */

  this.UploadDialog = function () {
    var opts = {sticky:true};
    CCreateDialog.apply(this, ['/', '/res/hub/dlg/upload.html', opts]);
  };
  this.UploadDialog.prototype = proto;

  proto.getTitle = function () {
    return 'Upload a file';
  };

  proto.show = function () {
    if (this.isLoading) return;
    CCreateDialog.prototype.show.apply(this, arguments);
  };

  proto.onShow = function () {
    this.ui.uplframe = ecma.dom.createElement('iframe', {
      'frameborder': 0,
      'class': 'uplframe'
    });
    this.evtLoad = new ecma.dom.EventListener(
      this.ui.uplframe, 'load', this.onIframeLoad, this);
    ecma.dom.setAttribute(
      this.ui.uplframe, 'src', '/res/hub/dlg/upload-form.html');
    this.ui.uplarea = this.dlg.getElementById('uplarea')
    ecma.dom.replaceChildren(this.ui.uplarea, [this.ui.uplframe]);
    CCreateDialog.prototype.onShow.apply(this);
  };

  proto.onIframeLoad = function () {
    var doc = ecma.dom.getContentDocument(this.ui.uplframe);
    var win = ecma.dom.getContentWindow(this.ui.uplframe);
    this.docjs = new ECMAScript.Class(win, doc);
    this.ui.uplform = this.docjs.dom.getElement('form');
    this.ui.uplctrl = this.docjs.dom.getElement('file');
    this.docjs.dom.addEventListener(this.ui.uplctrl, 'change', this.onChoose, this);
    this.ui.name.blur();
    this.evtLoad.remove();
  };

  proto.onChoose = function () {
    var fn = this.getFilename();
    this.setName(fn);
    this.ui.name.focus();
    CCreateDialog.prototype.updateUI.apply(this, arguments);
  };

  proto.isTargetValid = function () {
    if (!this.getFilename()) return false;
    return CCreateDialog.prototype.isTargetValid.apply(this);
  };

  proto.getFilename = function () {
    if (!this.ui.uplctrl) return '';
    var value = this.ui.uplctrl.value;
    var fn = value.replace(/\\/g, '/');
    var idx = fn.lastIndexOf('/');
    idx = ecma.util.defined(idx) ? idx + 1 : 0;
    fn = fn.substr(idx);
    return fn;
  };

  proto.onOk = function () {
    if (this.isTargetValid()) {
      var addr = this.srcNode.getAddress();
      var name = this.getName();
      var replace = ecma.dom.getValue(this.ui.replace) ? 1 : 0;
      var id = ecma.util.randomId();
      this.ui.uplform.action = '/api/hub/upload?'
        + 'X-Progress-ID=' + id
        + '&X-Auth-Token=' + ecma.lsn.auth.getAuthToken()
        + '&target=' + encodeURIComponent(addr)
        + '&name=' + name
        + '&replace=' + replace;
      this.ui.uplform.submit();
      this.isLoading = true;
      ecma.hubb.getInstance().progress(addr, name, id, 'upload', [this.onComplete, this]);
    }
  };

  proto.onComplete = function (dnode) {
    this.isLoading = false;
  };

});
