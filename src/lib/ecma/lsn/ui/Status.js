/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var _colors = ecma.lsn.ui.colors;

  /**
   * @class Status
   */

  this.Status = function () {
    this.statusTimeout = 3000;
    this.modalMask = null;
    this.loadingPopup = null;
  };

  var Status = this.Status.prototype = ecma.lang.createPrototype();

  Status.initStyles = function () {
    /*
    if (this.css) return;
    this.css = new ecma.dom.StyleSheet();
    this.css.updateRule('.statusPopup', {
      'text-align':'center',
      'border':'1px outset ' + _colors.gray1,
      'background-color':_colors.gray3,
      'color':_colors.black
    });
    this.css.updateRule('.statusNotify', {
      'border':'1px outset ' + _colors.gray1,
      'background-color':_colors.gray3,
      'color':_colors.black
    });
    this.css.updateRule('.statusAlert', {
      'border':'1px outset ' + _colors.gray1,
      'background-color':_colors.gray3,
      'color':_colors.black
    });
    this.css.updateRule('.statusPopup .footerButtons', {
      'text-align':'right'
    });
    return this.css;
    */
  };

  Status.constructPopup = function (cssClass) {
    var vp = ecma.dom.getViewportPosition();
    var pad = 12;
    var width = (vp.width/4) + (2*pad);
    var left = (vp.width/2) - (width/2);
    var popup = ecma.dom.createElement('div', {
      'style': {
        'position': 'absolute',
        'top': '5px',
        'width': width + 'px',
        'left': left + 'px',
        'padding': pad + 'px'
      }
    });
    ecma.dom.addClassNames(popup, 'statusPopup', cssClass);
    return popup;
  };

  Status.attachPopup = function (popup) {
    ecma.dom.setStyle(popup, 'z-index', ecma.lsn.zIndexAlloc());
    ecma.dom.getBody().appendChild(popup);
    return popup;
  };

  Status.createModalPopup = function (cssClass) {
    this.initStyles();
    var popup = this.constructPopup(cssClass);
    this.modalMask = new ecma.lsn.ui.Mask();
    this.modalMask.addActionListener(
      'onMaskAttach', function (action, popup) {
        this.attachPopup(popup);
      }, this, [popup]
    );
    this.modalMask.show();
    return popup;
  };

  Status.createPopup = function (cssClass) {
    this.initStyles();
    return this.attachPopup(this.constructPopup(cssClass));
  };

  Status.removePopup = function (event, popup) {
    if (this.modalMask) {
      this.modalMask.hide();
      this.modalMask = null;
    }
    ecma.lsn.zIndexFree();
    ecma.dom.stopEvent(event);
    ecma.dom.removeElement(popup);
  };

  Status.notify = function (text) {
    var contents = ecma.dom.createElements(
      'span', {
        'innerHTML': text,
        'style': {'font-size':'12px'}
      }
    );
    var popup = this.createPopup('statusNotify');
    ecma.dom.appendChildren(popup, contents);
    ecma.dom.setTimeout(this.removePopup, this.statusTimeout, this, [null, popup]);
  };

  Status.alert = function (text) {
    var popup = this.createModalPopup('statusAlert');
    var contents = ecma.dom.createElements(
      'span', {
        'innerHTML': text,
        'style': {'font-size':'12px'}
      },
      'div.footerButtons', [
        'button=OK', {
          'onClick': [this.removePopup, this, [popup]]
        }
      ]
    );
    ecma.dom.appendChildren(popup, contents);
  };

  Status.showLoading = function (text) {
    if (this.loadingPopup) return;
    var innerHTML = text ? text : 'Loading';
    var popup = this.createModalPopup('statusLoading');
    var contents = ecma.dom.createElements(
      'IMG.indicator', {
        'src': '/res/icons/16x16/status/loading.gif',
        'width': '16',
        'height': '16',
        'alt': 'Loading'
      },
      'SPAN', {
        'innerHTML': innerHTML,
        'style': {'font-size':'12px'}
      }
    );
    ecma.dom.appendChildren(popup, contents);
    this.loadingPopup = popup;
  };

  Status.hideLoading = function () {
    if (!this.loadingPopup) return;
    this.removePopup(null, this.loadingPopup);
  };


});
