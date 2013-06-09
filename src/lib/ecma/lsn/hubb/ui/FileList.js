/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CAction = ecma.action.ActionDispatcher;

  var _proto = ecma.lang.createPrototype(CAction);

  /**
   * @class FileList
   */

  this.FileList = function (rootAddr, canvasURL) {
    CAction.apply(this);
    this.ui = {};
    this.rootAddr = rootAddr;
    this.canvasURL = canvasURL || '/res/var/blank.html';
    this.filters = [];
    this.db = ecma.hubb.getInstance();
    this.db.fetch(this.rootAddr, [this.onFetch, this]);
  };

  this.FileList.prototype = _proto;

  _proto.onFetch = function (dnode) {
    if (!dnode) return;
    if (!this.ui.root) this.createUI();
    dnode.iterate(this.createItem, this);
  };

  _proto.createItem = function (name, dnode) {
    if (!this.applyFilters(name)) return;
    this.createFile(dnode);
  };

  _proto.createFile = function (dnode) {
    var file = new ecma.hubb.ui.FileItem(this.rootAddr, dnode, this.canvasURL);
    file.addActionListener('updateUI', this.updateUI, this);
    file.addActionListener('click', this.doClick, this);
    this.ui.items.appendChild(file.getRootElement());
  };

  _proto.getRootElement = function () {
    if (!this.ui.root) this.createUI();
    return this.ui.root;
  };

  _proto.createUI = function () {
    this.ui.items = ecma.dom.createElement('div.items');
    this.ui.btnAdd = ecma.dom.createElement('a=Add a file', {
      'href': '#doAddFile',
      'onClick': [this.doAddFile, this]
    });
    this.ui.root = ecma.dom.createElement('div', [
      this.ui.items,
      'div.add', [
        this.ui.btnAdd
      ]
    ]);
  };

  _proto.updateUI = function () {
    if (this.ui.items.childNodes.length > 0) {
      ecma.dom.setValue(this.ui.btnAdd, 'Add another file');
      ecma.dom.addClassName(this.ui.btnAdd.parentNode, 'addanother');
    } else {
      ecma.dom.setValue(this.ui.btnAdd, 'Add a file');
      ecma.dom.removeClassName(this.ui.btnAdd.parentNode, 'addanother');
    }
    this.dispatchAction('updateui');
  };

  _proto.doAddFile = function (event) {
    ecma.dom.stopEvent(event);
    this.createFile();
  };

  _proto.addFilter = function () {
    var cb = ecma.lang.createCallbackArray(arguments);
    this.filters.push(cb);
  };

  _proto.applyFilters = function (name) {
    var result = true;
    ecma.util.step(this.filters, function (cb) {
      if (result) result = ecma.lang.callback(cb, null, [name]);
    });
    return result;
  };

  _proto.doClick = function (action, dnode) {
    this.dispatchAction('click', dnode);
  };

});
