/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var UI_STATE_DEFAULT = 1;
  var UI_STATE_AUTHENTICATING = 2;
  var UI_STATE_AUTHENTICATED = 3;
  var UI_STATE_FAILED = 4;

  /**
   * @class LoginDialog
   */

  this.LoginDialog = function (dlgUri, loginUri) {
    this.ui = {};
    this.dlgUri = dlgUri || '/res/login/login.dlg';
    this.loginUri = loginUri || '/res/login/module.pm/login';
    this.dlg = new ecma.lsn.Dialog(this.dlgUri, {refetch: false});
    this.dlg.addEvent('load', [this.onLoad, this]);
    this.dlg.addEvent('show', [this.onShow, this]);
    this.dlg.addEvent('ok', [this.onOk, this]);
    this.dlg.addEvent('cancel', [this.onCancel, this]);
    this.dlg.addEvent('destroy', [this.onDestroy, this]);
    this.req = new ecma.lsn.Request(this.loginUri);
    this.req.addEventListener('success', this.onSuccess, this);
    this.req.addEventListener('failure', this.onFailure, this);
  };
  var proto = {};
  this.LoginDialog.prototype = proto;

  /**
   * @function show
   */

  proto.show = function (params) {
    this.dlg.show(params);
  };

  /**
   * @function hide
   */

  proto.hide = function () {
    this.dlg.hide();
  };

  proto.onLoad = function () {
    this.ui.un = this.dlg.getElementById('un');
    this.ui.pw = this.dlg.getElementById('pw');
    this.ui.msg = this.dlg.getElementById('msg');
    this.ui.btnbar = this.dlg.getElementById('btnbar');
    this.ui.btnOk = this.dlg.getElementById('btn_ok');
    this.ui.btnCancel = this.dlg.getElementById('btn_cancel');
    this.ui.kbUnEnter = new ecma.dom.KeyListener(this.ui.un, 'enter', this.onEnter, this);
    this.ui.kbPwEnter = new ecma.dom.KeyListener(this.ui.pw, 'enter', this.onEnter, this);
  };

  proto.enableButtons = function () {
    ecma.dom.removeAttribute(this.ui.un, 'readonly');
    ecma.dom.removeAttribute(this.ui.pw, 'readonly');
    ecma.dom.removeAttribute(this.ui.btnOk, 'disabled');
    ecma.dom.removeAttribute(this.ui.btnCancel, 'disabled');
  };

  proto.disableButtons = function () {
    ecma.dom.setAttribute(this.ui.un, 'readonly', 'readonly');
    ecma.dom.setAttribute(this.ui.pw, 'readonly', 'readonly');
    ecma.dom.setAttribute(this.ui.btnOk, 'disabled', 'disabled');
    ecma.dom.setAttribute(this.ui.btnCancel, 'disabled', 'disabled');
  };

  proto.updateUI = function (state) {
    if (state == UI_STATE_DEFAULT) {
      this.enableButtons();
      ecma.dom.setValue(this.ui.msg, '');
      ecma.dom.setClassName(this.ui.msg, 'authenticating');
      if (this.ui.cont) {
        ecma.dom.removeElement(this.ui.cont);
        delete this.ui.cont;
        this.ui.btnbar.appendChild(this.ui.btnCancel);
        this.ui.btnbar.appendChild(this.ui.btnOk);
      }
    } else if (state == UI_STATE_AUTHENTICATING) {
      this.disableButtons();
      ecma.dom.setClassName(this.ui.msg, 'authenticating');
      ecma.dom.setValue(this.ui.msg, 'Authenticating...');
    } else if (state == UI_STATE_FAILED) {
      this.enableButtons();
      ecma.dom.setValue(this.ui.msg, 'Login incorrect');
      ecma.dom.setClassName(this.ui.msg, 'failed');
    } else if (state == UI_STATE_AUTHENTICATED) {
      ecma.dom.setClassName(this.ui.msg, 'authenticated');
      ecma.dom.setValue(this.ui.msg, 'Success');
    } else {
      throw new Error('Unknown ui state: ' + state);
    }
  };

  proto.onShow = function () {
    ecma.dom.setValue(this.ui.un, '');
    ecma.dom.setValue(this.ui.pw, '');
    ecma.dom.setValue(this.ui.msg, '');
    this.updateUI(UI_STATE_DEFAULT);
    this.ui.un.focus();
  };

  proto.onEnter = function (event) {
    js.dom.stopEvent(event);
    this.onOk();
  };

  proto.onOk = function () {
    this.dlg.stopEvent();
    this.updateUI(UI_STATE_AUTHENTICATING);
    var un = ecma.dom.getValue(this.ui.un);
    var pw = ecma.dom.getValue(this.ui.pw);
    this.req.submit(ecma.lsn.auth.basic(un, pw));
  };

  proto.onCancel = function () {
    this.goNext(this.dlg.params.onCancel, this.dlg.params.onCancelUri);
  };

  proto.onDestroy = function () {
    this.ui.kbUnEnter.destroy();
    this.ui.kbPwEnter.destroy();
  };

  proto.onSuccess = function () {
    this.updateUI(UI_STATE_AUTHENTICATED);
    this.goNext(this.dlg.params.onSuccess, this.dlg.params.onSuccessUri);
  };

  proto.goNext = function (cb, uri) {
    if (cb) {
      this.hide();
      ecma.lang.callback(cb, this.dlg);
    } else if (uri) {
      var loc = new ecma.http.Location(uri);
      ecma.lang.assert(loc.isSameOrigin());
      if (false && ecma.dom.browser.isIE) {
        // Because in IE setting the document location via JavaScript
        // does not set the Referer header.
        // See: http://connect.microsoft.com/IE/feedback/ViewFeedback.aspx?FeedbackID=379975
        this.ui.cont = ecma.dom.createElement('a', {
          'href': loc.getUri(),
          'innerHTML': 'Continue'
        });
        ecma.dom.removeElement(this.ui.btnCancel);
        ecma.dom.removeElement(this.ui.btnOk);
        this.ui.btnbar.appendChild(this.ui.cont);
        this.ui.cont.focus();
      } else {
        if (ecma.document.location.href == loc.getUri()) {
          ecma.document.location.reload();
        } else {
          ecma.document.location.replace(loc.getUri());
        }
      }
    } else {
      this.hide();
    }
  };

  proto.onFailure = function (req) {
    var resp = req.xhr.responseText;
    var match = req.xhr.responseText.match(/nonce=([^;]+);/);
    if (match[1]) js.lsn.auth.setAuthToken(match[1]);
    ecma.dom.setValue(this.ui.pw, '');
    this.updateUI(UI_STATE_FAILED);
  };

});
