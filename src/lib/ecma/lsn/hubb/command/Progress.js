/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Progress
   */

  this.Progress = function () {
    CBase.call(this, 'progress');
    this.argspec = ['target', 'id', 'type', 'interval'];
    this.setParameter('interval', 2000); // ms
  };

  var Progress = this.Progress.prototype = ecma.lang.createPrototype(CBase);

  Progress.start = function () {
    this.checkStatus();
  };

  Progress.end = function () {
    this.req = null;
    this.executeAction('onComplete', this.result);
  };

  Progress.checkStatus = function () {
    ecma.dom.setTimeout(this.submit, this.getParameter('interval'), this);
  };

  Progress.submit = function () {
    if (this.req) {
      this.req.resubmit();
    } else {
      var verb = this.getParameter('type') + '_progress';
      this.req = new ecma.http.JSONRequest('/api/hub/' + verb, {
        'method': 'GET'
      });
      this.req.addEventListener('onSuccess', this.onSuccess, this);
      this.req.addEventListener('onNotSuccess', this.end, this);
      this.req.setHeader('X-Progress-ID', this.getParameter('id'));
      this.req.submit();
    }
  };

  Progress.onSuccess = function (r) {
    var result = r.responseJSON;
    var percent = 0;
    var rec = 0;
    var sz = 0;
    if (!result) return this.end();
    if (result.body) result = result.body; // lws always returns head/body as root nodes
    this.result = result;
    switch (result.state) {
      case 'starting' :
        sz = rec = 0;
        break;
      case 'uploading' :
        sz = result.size;
        rec = result.received;
        break;
      case 'done' :
        sz = rec = 1;
        break;
      case 'error' :
        var errorCode = result.status;
        // One error code that is interesting to track for clients is HTTP 
        // error 413 (Request entity too large) 
      default :
        return this.end();
    }
    var percent = Math.round((rec/sz)*100);
    if (isNaN(percent)) return this.checkStatus();
    var msg = percent + '% (' + rec + ' / ' + sz + ')';
    var stats = {
      'addr': this.getParameter('target'),
      'size': sz,
      'transfered': rec,
      'percent': percent,
      'display': {
        'size': sz,
        'transfered': rec,
        'message': msg
      }
    };
    this.executeAction('status', stats);
    if (result.state == 'done') return this.end();
    this.checkStatus();
  };

});
