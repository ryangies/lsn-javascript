/** @namespace console */
ECMAScript.Extend('console', function (ecma) {

  function _initBrowserConsole () {
    try {
      if (ecma.dom.browser.isOpera) {
        ecma.console.tee(new ecma.console.Opera());
        ecma.console.flush();
        return;
      }
      var win = ecma.window;
      while (win) {
        if (win.console) {
          ecma.console.tee(win.console);
          ecma.console.flush();
          break;
        }
        if (win.parent === win) break;
        win = win.parent;
      }
    } catch (ex) {
      // No-op
    }
  }

  /**
   * Attach to the window's console object.
   */
  _initBrowserConsole();

  /**
   * @class Opera
   */

  this.Opera = function () {};

  this.Opera.prototype.log = function () {
    if (!arguments.length) return;
    var args = ecma.util.args(arguments);
    ecma.window.opera.postError(args.join(' '));
  };

});
