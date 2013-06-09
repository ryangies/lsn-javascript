/** @namespace platform */
ECMAScript.Extend('platform', function (ecma) {
  var window = ecma.window;
  try {
    {#./native.history.js};
  } catch (ex) {
    // History.js will throw an execption when attempting to bind the adaptor a 
    // second time on the same window. That is when a second library instance
    // is being created.
    ///js.console.log('[History.js]', ex + '(Hint: Okay if there is a second library instance)');
  }
  this.history = window.History;
});
