/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CBase = ecma.lsn.ui.Base;

  /**
   * @class HeaderBodyFooterDialog
   * Implementation for HTML dialogs.
   *
   = Action Interface
   *
   * The below actions also invoke derived class methods of the same name.  By
   * default, actions are synchronous to allow for asynchronous actions (such
   * as effects and XHR loading) to complete.
   *
   *    onDialogShow      When .show() is invoked (and before anything happens)
   *    onDialogAttach    After the elements have been added to the document
   *    onDialogReady     After the dialog appears (asynchronous callbacks)
   *    onDialogHide      When .hide() is invoked (and before anything happens)
   *    onDialogDetach    After the elements have been removed from the document
   *
   *    Example:
   *
   *      var dlg = new ecma.lsn.ui.HeaderBodyFooterDialog();
   *
   *      dlg.show();     // onDialogShow
   *                      // onDialogAttach
   *                      //  - The appear affect is applied
   *                      // onDialogReady
   *
   *      dlg.hide();     // onDialogHide
   *                      //  - The disappear affect is applied
   *                      // onDialogDetach
   *
   */

  this.HeaderBodyFooterDialog = function () {
    CBase.apply(this);
    this.createUI();
    this.fxShow = new ecma.fx.effects.Opacify(this.getRoot(), 0, 1, 100);
    this.fxHide = new ecma.fx.effects.Opacify(this.getRoot(), 1, 0, 100);
  };

  var _proto = this.HeaderBodyFooterDialog.prototype = ecma.lang.createPrototype(
    CBase
  );

  /**
   * getRoot - Return the root element (DIV) of this dialog.
   * getHeader - Return the header element (DIV) of this dialog.
   * getBody - Return the body element (DIV) of this dialog.
   * getFooter - Return the footer element (DIV) of this dialog.
   */

  _proto.getRoot = function () { return this.uiRoot; };
  _proto.getHeader = function () { return this.uiHeader; };
  _proto.getBody = function () { return this.uiBody; };
  _proto.getFooter = function () { return this.uiFooter; };

  /**
   * show - Show the dialog.
   */

  _proto.show = function () {
    this.executeClassAction('onDialogShow');
    this.attach();
    this.appear([function () {
      this.dispatchClassAction('onDialogReady');
    }, this]);
  };

  /**
   * hide - Hide the dialog.
   */

  _proto.hide = function () {
    this.executeClassAction('onDialogHide');
    this.disappear([function () {
      this.detach();
    }, this]);
  };

  /**
   * attach - Attach the UI to the DOM.
   */

  _proto.attach = function (parentElem) {
    this.uiParent = parentElem || ecma.dom.getBody();
    ecma.dom.setStyle(this.uiRoot, 'z-index', this.zIndexAlloc());
    ecma.dom.appendChild(this.uiParent, this.uiRoot);
    this.executeClassAction('onDialogAttach');
  };

  /*
   * detach - Detach the UI from the DOM.
   */

  _proto.detach = function () {
    ecma.dom.removeElement(this.uiRoot);
    this.zIndexFree();
    ecma.dom.setStyle(this.uiRoot, 'z-index', '-1');
    this.executeClassAction('onDialogDetach');
  };

  _proto.appear = function (cb) {
    this.fxShow.start(cb);
  };

  _proto.disappear = function (cb) {
    this.fxHide.start(cb);
  };

  /**
   * createUI - Create the UI elements.
   */

  _proto.createUI = function () {
    this.uiHeader = ecma.dom.createElement('div', {
      'style': {
        'font-size': '0',
        'line-height': '0',
        'position': 'relative'
      }
    });
    this.uiBody = ecma.dom.createElement('div', {
      'style': {
        'overflow': 'auto',
        'position': 'relative'
      }
    });
    this.uiFooter = ecma.dom.createElement('div', {
      'style': {
        'font-size': '0',
        'line-height': '0',
        'position': 'relative'
      }
    });
    this.uiRoot = ecma.dom.createElement('div', {
      'style': {
        'position': 'absolute',
        'z-index': '-1',
        'top': '0',
        'left': '0',
        'padding': '0',
        'margin': '0'
      }
    }, [this.uiHeader, this.uiBody, this.uiFooter]);
    ecma.dom.setOpacity(this.uiRoot, 0);
  };

  /**
   * makeMoveable - Make this dialog moveable.
   */

  _proto.makeMoveable = function () {
    new ecma.dom.EventListener(this.uiHeader, 'onMouseDown', this.setMoveTarget, this),
    ecma.dom.setStyle(this.uiHeader, 'cursor', 'move')
  };

  /**
   * setMoveTarget - Event handler for dialog movement.
   */

  _proto.setMoveTarget = function (event) {
    ecma.lsn.setMoveTarget(event, this.uiRoot);
  };

});
