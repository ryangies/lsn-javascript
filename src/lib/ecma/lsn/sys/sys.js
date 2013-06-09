/** @namespace sys */
ECMAScript.extend('sys', function (ecma) {

  var _sys = undefined;

  /**
   * @function getInstance
   * Get the singleton system object.
   *
   *  var sys = ecma.sys.getInstance();
   *
   * Where:
   *
   *  @return sys <ecma.sys.System> System object
   *
   * The system object provides a common interface to generic methods such as
   * alerting status messages and capturing user input.  Since multiple windows
   * and dialogs are typically implemented using C<IFRAME> elements, this
   * method crawls up the window stack resulting in the system object of the
   * top-most window (which is running this library).
   *
   * See also:
   *
   *  L<ecma.sys.System>
   */

  this.getInstance = function () {
    if (_sys) return _sys;
    var win = ecma.window.parent;
    if (win && win.js && win.js.sys) {
      if (win.js.id != ecma.id) {
        _sys = win.js.sys.getInstance();
      }
    }
    if (!_sys) _sys = new ecma.sys.System();
    return _sys;
  };

});
