/** @namespace error */
ECMAScript.Extend('error', function (ecma) {

  var _package = this;

  /**
   * @function reportCaller - For tracing who called your function
   * @status Experimental
   *
   *  func1 () {
   *    func2();
   *  }
   *
   *  func2 () {
   *    ecma.error.reportCaller();
   *  }
   *
   * Should show this at the console:
   *
   *  at func1 (http://example.com/scripts.js:123:4)
   *
   * Note, designed for Webkit (no other tested)
   */

  _package.reportCaller = function () {
    var stack = new Error().stack;
    ecma.console.log(stack.split("\n")[3]);
  };

  /**
   * @function reportError
   * Report each `Error` object for debugging.
   */
  _package.reportError = function () {
    var console = ecma.console ? ecma.console : ecma.window.console;
    if (!(console && console.debug)) return; // Giving up
    for (var i = 0; i < arguments.length; i++) {
      var ex = arguments[i];
      console.debug(ex.stack ? ex.stack : ex);
    }
  };

});
