/** @namespace sandbox.app */
ECMAScript.Extend('sandbox.app', function (ecma) {

  var _instances = new Object(); // Global instances by app id

  /**
   * @function getInstance
   * Return or create the global instance for the given id.
   *  var obj = ecma.sandbox.getInstance();
   */

  this.getInstance = function (id, klass) {
    if (!id) id = ecma.util.randomId();
    var inst = _instances[id];
    if (!inst) {
      var win = ecma.window.top;
      if (win && win.js && win.js.sandbox && win.js.sandbox.app) {
        if (win.js.id != ecma.id) {
          return win.js.sandbox.app.getInstance(id, klass);
        }
      }
      if (!inst) {
        inst = _instances[id] = new klass();
      }
    }
    return inst;
  };

});
