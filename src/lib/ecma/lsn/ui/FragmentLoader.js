/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  /**
   * @class Fragment
   * Implementation for HTML fragments.
   *
   = Action Interface
   *
   * The below actions also invoke derived class methods of the same name.  By
   * default, actions are synchronous to allow for asynchronous actions (such
   * as effects and XHR loading) to complete.
   *
   *    onFragmentLoad      When .show() is called the first time.
   *    onFragmentShow      When .show() is invoked (and before anything happens)
   *    onFragmentAttach    After the elements have been added to the document
   *    onFragmentReady     After the fragment appears (asynchronous callbacks)
   *    onFragmentHide      When .hide() is invoked (and before anything happens)
   *    onFragmentDetach    After the elements have been removed from the document
   *    onFragmentUnload    If .canStore is false (not common)
   *
   *    Example:
   *
   *      var frg = new ecma.lsn.ui.Fragment();
   *
   *      frg.show();     // onFragmentLoad (the first time)
   *                      // onFragmentShow
   *                      // onFragmentAttach
   *                      //  - The appear affect is applied
   *                      // onFragmentReady
   *
   *      frg.hide();     // onFragmentHide
   *                      //  - The disappear affect is applied
   *                      // onFragmentDetach
   *                      // onFragmentUnload (optional)
   *
   */

  var CRequest = ecma.lsn.Request;

  this.Fragment = function (uri) {
    CRequest.apply(this, [uri, {'asynchronous': false}]);
    this.hasLoaded = false;
    this.canStore = true;
    this.nodeList = [];
    this.uiRoot = ecma.dom.createElement('div');
    this.fxShow = new ecma.fx.effects.Opacify(this.uiRoot, 0, 1, 100);
    this.fxHide = new ecma.fx.effects.Opacify(this.uiRoot, 1, 0, 100);
  };

  var _proto = this.Fragment.prototype = ecma.lang.createPrototype(
    CRequest
  );

  /**
   * show - Show the fragment.
   */

  _proto.show = function () {
    if (!this.hasLoaded) {
      this.submit();
      this.executeClassAction('onFragmentLoad');
    }
    this.executeClassAction('onFragmentShow');
    this.attach();

  };

  /**
   * @function onSuccess
   */

  _proto.onSuccess = function () {
    this.responseBody = this.responseHash.get('body');
    this.responseHead = this.responseHash.get('head');
  };

  /**
   * @function onNotSuccess
   */

  _proto.onNotSuccess = function () {
    this.responseBody = null;
    this.responseHead = null;
  };

  /**
   * attach - Attach the UI to the DOM.
   */

  _proto.attach = function (parentElem) {
    this.uiParent = parentElem || ecma.dom.getBody();
    if (this.hasLoaded) {
      ecma.dom.appendChildren(this.uiParent, [this.uiRoot, this.uiReady]);
      ecma.dom.waitUntil(
        function () {
          ecma.dom.removeElement(this.uiReady);
          this.executeClassAction('onFragmentAttach');
          this.appear([function () {
            this.dispatchClassAction('onFragmentReady');
          }, this]);
        },
        function () {
          return ecma.dom.getElement(this.uiReady.id) ? true : false;
        },
        10,
        this
      );
    } else {
      this.uiReady = ecma.dom.createElement('noscript', {'id':ecma.util.randomId('uiReady')});
      ecma.dom.setValue(this.uiRoot, this.responseBody);
      ecma.dom.setOpacity(this.uiRoot, 0);
      ecma.dom.appendChildren(this.uiParent, [this.uiRoot, this.uiReady]);
      ecma.lsn.includeHeadCSS(this.responseHead, null, this);
      ecma.dom.waitUntil(
        function () {
          ecma.dom.removeElement(this.uiReady);
          ecma.lsn.includeHeadJS(this.responseHead, null, this, function () {
            this.hasLoaded = true;
            this.executeClassAction('onFragmentAttach');
            this.appear([function () {
              this.dispatchClassAction('onFragmentReady');
            }, this]);
          });
        },
        function () {
          return ecma.dom.getElement(this.uiReady.id) ? true : false;
        },
        10,
        this
      );
    }
  };

  /**
   * @function appear
   */

  _proto.appear = function (cb) {
    this.fxShow.start(cb);
  };

  /**
   * hide - Hide the fragment.
   */

  _proto.hide = function () {
    this.executeClassAction('onFragmentHide');
    this.disappear([function () {
      this.detach();
    }, this]);
  };

  /**
   * @function disappear
   */

  _proto.disappear = function (cb) {
    this.fxHide.start(cb);
  };

  /*
   * detach - Detach the UI from the DOM.
   */

  _proto.detach = function () {
    ecma.dom.removeElement(this.uiRoot);
    this.executeClassAction('onFragmentDetach');
    if (!this.canStore) {
      this.unload();
    }
  };

  /**
   * @function unload
   */

  _proto.unload = function () {
    this.nodeList = [];
    this.hasLoaded = false;
    this.executeClassAction('onFragmentUnload');
  };

});
