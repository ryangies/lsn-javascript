/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var _dlgUri = '/res/hub/dlg/browse.html';
  var proto = {};

  /**
   * @class BrowseDialog
   */

  this.BrowseDialog = function (rootAddr, dlgUri) {
    this.ui = {};
    this.rootAddr = rootAddr || '/';
    this.dlg = new ecma.lsn.Dialog(dlgUri || _dlgUri, {refetch: false});
    this.dlg.addEvent('load', [this.onLoad, this]);
    this.dlg.addEvent('show', [this.onShow, this]);
    this.dlg.addEvent('ok', [this.onOk, this]);
    this.dlg.addEvent('cancel', [this.onCancel, this]);
    this.destNode = null;
  };
  this.BrowseDialog.prototype = proto;

  proto.show = function (addr) {
    this.srcAddr = addr || this.rootAddr;
    this.dlg.show();
  };

  proto.hide = function () {
    if (this.tview) {
      this.tview.destroyListeners();
    }
    this.dlg.hide();
  };

  proto.onSelect = function (action, tnode) {
    this.destNode = tnode.data;
    this.updateUI();
  };

  proto.onDeselect = function (action, tnode) {
    this.destNode = null;
    this.updateUI();
  };

  proto.getTarget = function () {
    return this.destNode;
  };

  proto.isTargetValid = function () {
    return this.destNode ? true : false;
  };

  proto.updateUI = function () {
    if (this.isTargetValid()) {
      ecma.dom.removeAttribute(this.ui.btnOk, 'disabled');
    } else {
      ecma.dom.setAttribute(this.ui.btnOk, 'disabled', 'disabled');
    }
  };

  proto.onLoad = function () {
    this.ui.tview = this.dlg.getElementById('tview');
    this.ui.btnOk = this.dlg.getElementById('btn_ok');
    this.ui.btnCancel = this.dlg.getElementById('btn_cancel');
  };

  proto.onShow = function () {
    this.attachView();
    this.tview.select(this.srcAddr);
  };

  proto.onOk = function () {
  };

  proto.onCancel = function () {
  };

  proto.attachView = function () {
    if (this.tview) {
      this.tview.initListeners();
    } else {
      this.tview = new ecma.hubb.ui.TreeView(this.rootAddr);
      this.tview.addActionListener('select', this.onSelect, this);
      this.tview.addActionListener('deselect', this.onDeselect, this);
      ecma.dom.replaceChildren(this.ui.tview, [this.tview.getElement()]);
    }
  };

});
