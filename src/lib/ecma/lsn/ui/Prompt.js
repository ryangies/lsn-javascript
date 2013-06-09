/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CStatus = ecma.lsn.ui.Status;

  /**
   * @class Prompt
   */

  this.Prompt = function () {
    CStatus.apply(this);
  };

  var Prompt = this.Prompt.prototype = ecma.lang.createPrototype(
    CStatus
  );

  Prompt.confirm = function (text, cb) {
    var popup = this.createModalPopup('statusConfirm');
    var uiButtonNo = js.dom.createElement('button=No', {
      'onClick': [this.onConfirm, this, [popup, false, cb]]
    });
    var uiButtonYes = js.dom.createElement('button=Yes', {
      'onClick': [this.onConfirm, this, [popup, true, cb]]
    });
    var contents = ecma.dom.createElements(
      'span', {
        'innerHTML': text,
        'style': {'font-size':'12px'}
      },
      'div.footerButtons', [uiButtonNo, uiButtonYes]
    );
    ecma.dom.appendChildren(popup, contents);
    uiButtonNo.focus();
  };

  Prompt.onConfirm = function (event, popup, result, cb) {
    this.removePopup(event, popup);
    if (cb) ecma.lang.callback(cb, null, [result]);
  };

});
