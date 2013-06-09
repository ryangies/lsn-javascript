/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var proto = {};

  /**
   * @class CreateDialog
   */

  this.CreateDialog = function (rootAddr, dlgURL, dlgOpts) {
    this.ui = {};
    this.rootAddr = rootAddr;
    var opts = {refetch: false};
    if (dlgOpts) ecma.util.overlay(opts, dlgOpts);
    this.dlg = new ecma.lsn.Dialog(dlgURL, opts);
    this.dlg.addEvent('load', [this.onLoad, this]);
    this.dlg.addEvent('show', [this.onShow, this]);
    this.dlg.addEvent('ok', [this.onOk, this]);
    this.dlg.addEvent('cancel', [this.onCancel, this]);
  };
  this.CreateDialog.prototype = proto;

  proto.show = function (dnode) {
    if (!dnode) throw new Error('Missing source node');
    if (!dnode.hasFetched()) dnode.fetch();
    this.srcNode = dnode;
    this.dlg.show();
  };

  proto.hide = function () {
    this.dlg.hide();
  };

  proto.getName = function () {
    return ecma.dom.getValue(this.ui.name);
  };

  proto.setName = function (name) {
    return ecma.dom.setValue(this.ui.name, name);
  };

  proto.getAddress = function () {
    var addr = this.srcNode.getAddress();
    var name = this.getName();
    var addr = ecma.data.addr_normalize(addr + '/' + name);
    return addr;
  };

  proto.isNameValid = function () {
    var name = this.getName();
    if (!name) return false;
    if (new String(name).match(/[\/:?#;&]/)) return false;
    return true;
  };

  proto.isTargetValid = function () {
    if (!this.isNameValid()) return false;
    var addr = this.getAddress();
    if (!ecma.dom.getValue(this.ui.replace)) {
      if (ecma.hubb.getInstance().getNodeByAddress(addr)) return false;
    }
    return true;
  };

  proto.updateUI = function () {
    ecma.dom.setValue(this.ui.toaddr, this.getAddress());
    if (this.isNameValid()) {
      ecma.dom.removeClassName(this.ui.name, 'invalid');
    } else {
      ecma.dom.addClassName(this.ui.name, 'invalid');
    }
    if (this.isTargetValid()) {
      ecma.dom.removeAttribute(this.ui.btnOk, 'disabled');
      ecma.dom.removeClassName(this.ui.toaddr, 'invalid');
    } else {
      ecma.dom.setAttribute(this.ui.btnOk, 'disabled', 'disabled');
      ecma.dom.addClassName(this.ui.toaddr, 'invalid');
    }
  };

  proto.onLoad = function () {
    this.ui.name = this.dlg.getElementById('name');
    this.ui.replace = this.dlg.getElementById('replace');
    this.ui.toaddr = this.dlg.getElementById('toaddr');
    this.ui.btnOk = this.dlg.getElementById('btn_ok');
    this.ui.btnCancel = this.dlg.getElementById('btn_cancel');
    this.ui.title = this.dlg.getElementById('dlgtitle');
    this.actNameChange = new ecma.lsn.InputListener(this.ui.name);
    this.actNameChange.addActionListener('change', this.updateUI, this);
    if (this.ui.replace) {
      this.actReplace = new ecma.dom.EventListener(this.ui.replace, 'change', this.updateUI, this);
    }
  };

  proto.onNameChange = function (event) {
    this.updateUI();
  };

  proto.onShow = function () {
    this.setName('');
    ecma.dom.setValue(this.ui.title, this.getTitle());
    if (this.ui.replace) ecma.dom.setValue(this.ui.replace, false);
    this.ui.name.focus();
    this.updateUI();
  };

  proto.getTitle = function () {
    return 'Create';
  };

  proto.onOk = function () {
  };

  proto.onCancel = function () {
  };

});
