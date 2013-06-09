/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @instance dispatcher <ecma.action.ActionDispatcher>
   */

  this.dispatcher = new ecma.action.ActionDispatcher();

  /**
   * @function addActionListener
   * @function removeActionListener
   * @function executeClassAction
   * @function executeAction
   * @function dispatchAction
   * @function dispatchClassAction
   */

  var proxyFunctions = [
    'addActionListener',
    'removeActionListener',
    'executeAction',
    'executeClassAction',
    'dispatchAction',
    'dispatchClassAction'
  ];

  ecma.lang.createProxyFunction(proxyFunctions, this, this.dispatcher);

});
