/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CBase = ecma.lsn.ui.Base;

  /**
   * @class Dialog
   * Implementation for HTML dialogs.
   *
   = Action Interface
   *
   * The below actions also invoke derived class methods of the same name.  By
   * default, actions are synchronous to allow for asynchronous actions (such
   * as effects and XHR loading) to complete.
   *
   *    onDialogLoad      When .show() is called the first time.
   *    onDialogShow      When .show() is invoked (and before anything happens)
   *    onDialogAttach    After the elements have been added to the document
   *    onDialogReady     After the dialog appears (asynchronous callbacks)
   *    onDialogHide      When .hide() is invoked (and before anything happens)
   *    onDialogDetach    After the elements have been removed from the document
   *
   *    Example:
   *
   *      var dlg = new ecma.lsn.ui.Dialog();
   *
   *      dlg.show();     // onDialogShow
   *                      // onDialogAttach
   *                      //  - The dialog is centered
   *                      //  - The appear affect is applied
   *                      // onDialogReady
   *
   *      dlg.hide();     // onDialogHide
   *                      //  - The disappear affect is applied
   *                      // onDialogDetach
   *
   */

  var REL_PERSIST   = 0; // Content remains attached to the DOM after detach
  var REL_ORPHAN    = 1; // Content elements are removed after detach

  this.Dialog = function (content, rel) {
    CBase.apply(this);
    this.rel = rel || REL_PERSIST;
    this.swapMarker = null;
    this.hasLoaded = false;
    this.position = null;
    this.mask = null;
    this.createUI();
    this.fxDuration = 100;
    this.fxShow = new ecma.fx.effects.Opacify(this.getRoot(), 0, 1, this.fxDuration);
    this.fxHide = new ecma.fx.effects.Opacify(this.getRoot(), 1, 0, this.fxDuration);
    if (content) this.setContent(content);
    this.addActionListener('onClose', this.hide, this); // ui callback
  };

  var _proto = this.Dialog.prototype = ecma.lang.createPrototype(
    CBase
  );

  /**
   * getRoot - Return the root element (DIV) of this dialog.
   */

  _proto.getRoot = function () { return this.uiRoot; };

  /**
   * load - Load any resources needed by this dialog.
   *
   * This is NOT an asynchronous method as the dialog cannot proceed until the
   * resources have been loaded.  If XHR requests are employed they should be
   * called synchronously.
   */

  _proto.load = function () {
  };

  /**
   * show - Show the dialog.
   */

  _proto.show = function (/*...*/) {
    var args = ecma.util.args(arguments);
    if (!this.hasLoaded) {
      this.load();
      this.executeClassAction('onDialogLoad');
      this.hasLoaded = true;
    }
    this.executeClassAction.apply(this, ['onDialogShow'].concat(args));
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

  _proto.setParentElement = function (parentElem) {
    if (this.mask) this.mask.setUIParent(parentElem);
    return this.uiParent = parentElem;
  };

  _proto.getParentElement = function (parentElem) {
    return parentElem || this.uiParent || ecma.dom.getBody();
  };

  /**
   * attach - Attach the UI to the DOM.
   */

  _proto.attach = function (parentElem) {
    ecma.dom.setStyle(this.uiRoot, 'z-index', this.zIndexAlloc());
    ecma.dom.appendChild(this.getParentElement(parentElem), this.uiRoot);
    this.executeClassAction('onDialogAttach');
    this.setPosition();
  };

  /**
   * setPosition - Center the dialog within the viewport.
   */

  _proto.setPosition = function () {
    var elem = this.getRoot();
    ecma.dom.setStyles(elem, {
      'top': '0px',
      'left': '0px'
    });
    this.center();
  };

  _proto.center = function () {
    var elem = this.getRoot();
    var w = ecma.dom.getContentWidth(elem);
    var h = ecma.dom.getContentHeight(elem);
    var vp = ecma.dom.getViewportPosition();
    var posTop = (vp.height - h) / 4;
    var posLeft = (vp.width - w) / 2;
    var minTop = 0;
    var minLeft = 0;
    if (this.position == 'absolute') {
      posTop += vp.top;
      posLeft += vp.left;
      minTop = vp.top;
      minLeft = vp.left;
    }
    posTop = Math.max(posTop, minTop);
    posLeft = Math.max(posLeft, minLeft);
    ecma.dom.setStyles(elem, {
      'top': posTop + 'px',
      'left': posLeft + 'px'
    });
  };

  /*
   * detach - Detach the UI from the DOM.
   */

  _proto.detach = function () {
    if (this.rel == REL_ORPHAN) {
      ecma.dom.removeElement(this.uiRoot);
    }
    ecma.dom.setStyle(this.uiRoot, 'z-index', '-1');
    this.zIndexFree();
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
   *
   * TODO
   *  - Use capabilities [not vendor] for position style
   *  - Upgrade ecma.platform w/ capabilities support
   * 
   * XXX
   *  Fixed position works with IE8, however top and left coordinates are
   *  relative to a different origin.
   */

  _proto.createUI = function () {
    this.position = ecma.platform.isIE ? 'absolute' : 'fixed';
    this.uiRoot = ecma.dom.createElement('div', {
      'style': {
        'position': this.position,
        'z-index': '-1'
      }
    });
    ecma.dom.setOpacity(this.uiRoot, 0);
    return this.uiRoot;
  };

  /**
   * setContents - Set the dialog contents
   *
   *  @param content <Element> An element whose child nodes make up the dialog.
   *
   * The single argument C<content> is used in favor of the method where that
   * element exists on the page, however it is set to display:none.  Its
   * children are then detached and append to this dialog's root element.
   */

  _proto.setContents = function (content) {
    this.hook(content);
    ecma.dom.replaceChildren(this.uiRoot, content.childNodes);
    return this.uiRoot;
  };

  /**
   * setContent - Set the dialog contents
   *
   *  @param content <Element> An element which comprises the dialog
   *
   */

  _proto.setContent = function (content) {
    this.hook(content);
    ecma.dom.replaceChildren(this.uiRoot, [content]);
    return this.uiRoot;
  };

  /**
   * hook - Create handlers for action elements.
   *
   * Elements which indicate actions are assigned an onClick handler which
   * invokes any action listeners.  The way to do this is:
   *
   *    A       set the rel attribute to "action"
   *            set the hash portion of the href attribute to the action name
   *
   *    BUTTON  type cannot be "submit"
   *            set the name to "action"
   *            set the value to the name of the action
   *
   * Examples:
   *
   *    <a rel="action" href="#close">Close</a>
   *
   *    <button type="button" name="action" value="close">Close</button>
   *
   */

  _proto.hook = function (content) {

    var list = [];

    // Anchors
    var links = ecma.dom.getElementsByTagName(content, 'A');
    for (var i = 0, node; node = links[i]; i++) {
      var rel = ecma.dom.getAttribute(node, 'rel');
      if (rel == 'action') {
        var action = new ecma.http.Location(node.href).getHash();
        list.push([node, action]);
      }
    }

    // Buttons
    var buttons = ecma.dom.getElementsByTagName(content, 'BUTTON');
    for (var i = 0, node; node = buttons[i]; i++) {
      var type = ecma.dom.getAttribute(node, 'type');
      if (type == 'submit') continue;
      var name = ecma.dom.getAttribute(node, 'name');
      if (name != 'action') continue;
      var action = ecma.dom.getAttribute(node, 'value');
      list.push([node, action]);
    }

    // Make them into handlers
    for (var i = 0, item; item = list[i]; i++) {
      var elem = item[0];
      var action = item[1];
      ecma.dom.addEventListener(elem, 'onClick', function (event, action) {
        ecma.dom.stopEvent(event);
        this.executeAction(action);
      }, this, [action]);
    }

  };

  /**
   * @function getElementById
   */

  _proto.getElementById = function (id) {
    function walk (elem) {
      if (elem.id == id) return elem;
      var child = elem.firstChild;
      var result = undefined;
      while (!result && child) {
        result = walk(child);
        child = child.nextSibling;
      }
      return result;
    }
    return this.uiRoot ? walk(this.uiRoot) : undefined;
  };

  /**
   * @function makeModal
   * Display an underlying modal mask when the dialog is shown.
   */

  _proto.makeModal = function () {
    if (!this.mask) {
      this.mask = new ecma.lsn.ui.Mask(this.uiParent);
      this.mask.setOpacity(0);
      this.addActionListener('onDialogShow', this.mask.show, this.mask);
      this.addActionListener('onDialogHide', this.mask.hide, this.mask);
    }
    return this.mask;
  };

  /**
   * @function makeMasked
   * Display an underlying mask which closes the dialog when clicked.
   */

  _proto.makeMasked = function () {
    if (!this.mask) {
      this.mask = new ecma.lsn.ui.Mask(this.uiParent);
      this.addActionListener('onDialogShow', this.mask.show, this.mask);
      this.addActionListener('onDialogHide', this.mask.hide, this.mask);
      this.evtMaskClick = new ecma.dom.EventListener(this.mask.getRoot(), 
        'click', this.hide, this);
    }
    return this.mask;
  };

  /**
   * makeMoveable - Make this dialog moveable.
   * @param handle <Element|ID> Move handle
   */

  _proto.makeMoveable = function (handle) {
    this.makeModal();
    if (handle) {
      ecma.dom.setStyle(handle, 'cursor', 'move')
      new ecma.dom.EventListener(handle, 'onMouseDown',
        function (event) {
          new ecma.lsn.Move(event, this.uiRoot);
        }, this
      );
    }
  };

});
