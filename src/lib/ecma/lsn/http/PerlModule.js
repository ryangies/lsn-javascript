/** @namespace http */
ECMAScript.Extend('http', function (ecma) {
  
  var CDispatcher = ecma.action.ActionDispatcher;

  var _proto = ecma.lang.createPrototype(CDispatcher);

  /**
   * @class PerlModule
   */

  this.PerlModule = function (url) {
    CDispatcher.call(this);
    this.moduleURL = url;
  };

  this.PerlModule.prototype = _proto;

  /**
   * @function submit
   */

  _proto.setModuleURL = function (url) {
    this.moduleURL = url;
  };

  _proto.submit = function (subName, params, cb) {
    var req = new ecma.lsn.Request(this.moduleURL + '/' + subName);
    req.addEventListener('onComplete', this.doSubmitComplete, this, [cb]);
    req.submit(params);
    this.dispatchClassAction('onSend', req);
  };

  _proto.doSubmitComplete = function (req, cb) {
    var data = req && req.responseHash
      ? req.responseHash.get('body')
      : undefined;
    if (cb) ecma.lang.callback(cb, this, [data, req]);
    this.dispatchClassAction('onRecv', req);
  };

});
