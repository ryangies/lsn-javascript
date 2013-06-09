/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var proto = {};

  /**
   * @class TargetDialog
   */

  this.TargetDialog = function (rootAddr, dlgURL) {
    this.ui = {};
    this.rootAddr = rootAddr;
    this.dlg = new ecma.lsn.Dialog(dlgURL, {refetch: false});
    this.dlg.addEvent('load', [this.onLoad, this]);
    this.dlg.addEvent('show', [this.onShow, this]);
    this.dlg.addEvent('ok', [this.onOk, this]);
    this.dlg.addEvent('cancel', [this.onCancel, this]);
  };
  this.TargetDialog.prototype = proto;

  proto.show = function (dnode) {
    if (!dnode) throw new Error('Missing source node');
    this.srcNode = dnode;
    this.dlg.show();
  };

  proto.hide = function () {
    this.dlg.hide();
  };

  proto.onSelect = function (action, tnode) {
    this.destNode = tnode.data;
    this.updateUI();
  };

  proto.getName = function () {
    return ecma.dom.getValue(this.ui.name);
  };

  proto.getAddress = function () {
    if (!this.destNode) return '';
    var addr = this.destNode.getAddress();
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
    if (!addr) return false;
    var srcAddr = this.srcNode.getAddress();
    if (addr == srcAddr || addr.indexOf(srcAddr + '/') == 0) return false;
    if (ecma.hubb.getInstance().getNodeByAddress(addr)) return false;
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
    this.ui.tview = this.dlg.getElementById('tview');
    this.ui.name = this.dlg.getElementById('name');
    this.ui.toaddr = this.dlg.getElementById('toaddr');
    this.ui.btnOk = this.dlg.getElementById('btn_ok');
    this.ui.btnCancel = this.dlg.getElementById('btn_cancel');
    this.actNameChange = new ecma.lsn.InputListener(this.ui.name);
    this.actNameChange.addActionListener('change', this.updateUI, this);
  };

  proto.onNameChange = function (event) {
    this.updateUI();
  };

  proto.onShow = function () {
    var paddr = ecma.data.addr_parent(this.srcNode.getAddress());
    var name = ecma.data.addr_name(this.srcNode.getAddress());
    ecma.dom.setValue(this.ui.name, name);
    if (this.srcNode.isData()) {
      this.attachDataList(paddr);
    } else {
      this.attachFolderList(paddr);
    }
    this.ui.name.focus();
  };

  proto.onOk = function () {
  };

  proto.onCancel = function () {
  };

  proto.attachFolderList = function (addr) {
    if (!this.folderList) {
      this.folderList = new ecma.hubb.ui.FolderList(this.rootAddr);
      this.folderList.addActionListener('select', this.onSelect, this);
    }
    ecma.dom.replaceChildren(this.ui.tview, [
      this.folderList.getElement()
    ]);
    this.folderList.select(addr);
  };

  proto.attachDataList = function (addr) {
    if (!this.dataList) {
      this.dataList = new ecma.hubb.ui.DataList(this.rootAddr);
      this.dataList.addActionListener('select', this.onSelect, this);
    }
    ecma.dom.replaceChildren(this.ui.tview, [
      this.dataList.getElement()
    ]);
    this.dataList.select(addr);
  };

});
