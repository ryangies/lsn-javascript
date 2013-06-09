/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  var CBase = ecma.lsn.hubb.command.Base;

  /**
   * @class Download
   */

  this.Download = function () {
    CBase.call(this, 'download');
    this.argspec = ['target', 'name', 'uri', 'replace'];
  };

  var Download = this.Download.prototype = ecma.lang.createPrototype(CBase);

  Download.fixup = function () {
    // The response from the download command indicates the server started
    // receiving data.  A parallel process (download progress) will poll
    // the server. When the transfer is complete, that process will receive
    // the response for the remote object.
  };

});
