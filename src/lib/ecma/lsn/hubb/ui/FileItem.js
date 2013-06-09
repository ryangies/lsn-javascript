/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  var CAction = ecma.action.ActionDispatcher;

  /**
   * @class FileItem
   */

  this.FileItem = function (rootAddr, dnode, canvasURL) {
    CAction.apply(this);
    this.rootAddr = rootAddr;
    this.fileAddr = null;
    this.fileName = null;
    this.canvasURL = canvasURL;
    this.dnode = dnode;
    this.hasCancelled = false;
    this.ui = {};
    this.db = ecma.hubb.getInstance();
    this.db.addActionListener('create', this.onDataAction, this);
    this.db.addActionListener('update', this.onDataAction, this);
    this.db.addActionListener('remove', this.onDataRemoved, this);
    this.db.addActionListener('status', this.onUploadStatus, this);
  };

  var _proto = this.FileItem.prototype = ecma.lang.createPrototype(CAction);

  _proto.getRootElement = function () {
    this.createUI();
    if (this.dnode) {
      this.fileAddr = this.dnode.getAddress();
      this.fileName = this.dnode.getKey();
      this.createDisplayUI();
    } else {
      this.createUploadUI();
    }
    this.updateUI();
    return this.ui.root;
  };

  _proto.getFilename = function () {
    if (this.fileName) return this.fileName;
    var value = this.js2.dom.getValue(this.ui.ctrl);
    if (!value) return;
    var fileName = value.replace(/\\/g, '/');
    var idx = fileName.lastIndexOf('/');
    idx = ecma.util.defined(idx) ? idx + 1 : 0;
    fileName = fileName.substr(idx);
    return fileName;
  };

  _proto.createUI = function () {
    if (this.ui.root) return;
    this.ui.root = ecma.dom.createElement('div.item');
  };

  _proto.createUploadUI = function () {
    this.ui.iframe = ecma.dom.createElement('iframe', {
      'src': this.canvasURL,
      'frameborder': '0',
      'allowtransparency': true,
      'style': {
        'background-color': 'transparent',
        'width': '100%',
        'height': '30px'
      }
    });
    this.evtLoad = new ecma.dom.EventListener(
      this.ui.iframe, 'load', this.onIframeLoad, this);
    ecma.dom.replaceChildren(this.ui.root, [this.ui.iframe]);
  };

  _proto.onIframeLoad = function () {
    this.evtLoad.remove();
    delete this.evtLoad;
    var doc = ecma.dom.getContentDocument(this.ui.iframe);
    var win = ecma.dom.getContentWindow(this.ui.iframe);
    this.js2 = new ECMAScript.Class(win, doc);
    this.ui.ctrl = this.js2.dom.createElement('input.file', {
      'type': 'file',
      'name': 'file', // must be 'file' for lws built-in uploads
      'onChange': [this.doUploadFile, this]
    });
    this.ui.form = this.js2.dom.createElement('form.upload', {
      'method': 'POST',
      'enctype': 'multipart/form-data'
    }, [
      this.ui.ctrl,
      '#text= ',
      'small', [
        '#text=(maximum 60Mb) (',
        'a.lnk=Cancel', {
          'onClick': [this.doRemoveForm, this]
        },
        '#text=)'
      ]
    ]);
    try {
      /** Fix for IE7 as 'enctype' attribute above is not honored */
      this.ui.form.encoding = 'multipart/form-data';
    } catch (ex) {
    }
    var body = this.js2.dom.getBody();
    var css = new this.js2.dom.StyleSheet();
    css.updateRules('html, html body, form', 'background-color:transparent;');
    css.updateRules('html, html body, form', 'margin:0;padding:0;');
    css.updateRules('html, html body', 'overflow:hidden;height:30px;');
    css.updateRule('a.lnk', 'cursor:pointer;');
    body.appendChild(this.ui.form);
    var h = this.js2.dom.getHeight(body);
    ecma.dom.setStyle(this.ui.iframe, 'height', h + 'px');
  };

  _proto.createDisplayUI = function () {
    this.ui.icon = ecma.dom.createElement('img.icon');
    this.ui.fileName = ecma.dom.createElement('span.fileName');
    this.ui.remove = ecma.dom.createElement('a', {
      'class': 'lnk action',
      'onClick': [this.doRemoveFile, this]
    });
    this.ui.anchor = ecma.dom.createElement('a', {
      'class': 'lnk open',
      'href': this.fileAddr,
      'onClick': [this.doClick, this]
    }, [
      this.ui.icon,
      this.ui.fileName
    ]);;
    this.ui.actions = ecma.dom.createElement('span.actions', [
      '#text= (',
      this.ui.remove,
      '#text=)'
    ]);
    this.ui.display = ecma.dom.createElement('div', [
      this.ui.anchor,
      this.ui.actions
    ]);
    ecma.dom.setStyle(this.ui.iframe, 'display', 'none');
    ecma.dom.appendChildren(this.ui.root, [this.ui.display]);
  };

  _proto.isUploading = function () {
    return this.dnode && this.dnode.getType() == 'loading';
  };

  _proto.updateUI = function () {
    if (this.ui.display && this.dnode) {
      ecma.dom.setAttribute(this.ui.icon, 'src', this.dnode.getIcon());
      if (this.isUploading()) {
        ecma.dom.setValue(this.ui.fileName, '(0%) ' + this.fileName);
        ecma.dom.setValue(this.ui.remove, 'Cancel');
      } else {
        ecma.dom.setValue(this.ui.fileName, this.dnode.getKey());
        ecma.dom.setValue(this.ui.remove, 'Remove');
      }
    }
    this.dispatchAction('updateUI', this);
  };

  _proto.doRemoveForm = function (event) {
    ecma.dom.stopEvent(event);
    ecma.dom.removeElement(this.ui.root);
    this.updateUI();
  };

  _proto.doUploadFile = function (event) {
    var fileName = this.getFilename();
    if (!fileName) return;
    var addr = this.rootAddr + '/' + fileName;
    if (this.db.getNodeByAddress(addr)) {
      alert(fileName + ' already exists!');
      this.ui.form.reset();
      return;
    }
    var id = ecma.util.randomId();
    this.fileAddr = addr;
    this.fileName = fileName;
    this.ui.form.action = '/api/hub/upload?'
      + 'X-Progress-ID=' + id
      + '&target=' + encodeURIComponent(this.rootAddr)
      + '&name=' + encodeURIComponent(fileName);
      + '&replace=0';
    this.ui.form.submit();
    this.db.progress(this.rootAddr, fileName, id, 'upload', [this.onUploaded, this]);
  };

  _proto.doRemoveFile = function (event) {
    ecma.dom.stopEvent(event);
    if (this.isUploading()) {
      if (confirm('Really cancel the upload of: ' + this.fileName)) {
        ecma.dom.removeElement(this.ui.iframe);
        this.ui.iframe = null;
        this.hasCancelled = true;
        ecma.dom.removeElement(this.ui.actions);
      }
    } else {
      if (confirm('Do you really want to delete: ' + this.fileName)) {
        this.db.remove(this.fileAddr);
      }
    }
  };

  _proto.doClick = function (event) {
    ecma.dom.stopEvent(event);
    if (this.isUploading() || this.hasCancelled) return;
    var elem = js.dom.getEventTarget(event);
    if (elem) elem.blur();
    this.dispatchAction('click', this.dnode);
  };

  _proto.onUploaded = function (dnode) {
    if (this.hasCancelled) {
      // The upload completed before the cancel could take place
      if (dnode) this.db.remove(this.fileAddr);
      return;
    }
    if (!dnode) {
      alert ('Upload Failed: ' + this.fileName);
    } else {
      ecma.dom.removeElement(this.ui.iframe);
    }
  };

  _proto.onDataAction = function (action, dnode) {
    var addr = dnode.getAddress();
    if (addr != this.fileAddr) return;
    if (!this.dnode) this.dnode = dnode;
    if (!this.ui.display) {
      this.createDisplayUI();
    }
    this.updateUI();
  };

  _proto.onUploadStatus = function (action, stats) {
    if (stats.addr != this.fileAddr) return;
    var prefix =  this.hasCancelled
      ? '(Cancelling...) '
      : '(' + stats.percent + '%) ';
    ecma.dom.setValue(this.ui.fileName, prefix + this.fileName);
  };

  _proto.onDataRemoved = function (action, dnode) {
    var addr = dnode.getAddress();
    if (addr != this.fileAddr) return;
    if (this.ui.root) ecma.dom.removeElement(this.ui.root);
    this.updateUI();
  };

});
