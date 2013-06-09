/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  var _package = this; // ecma.dom
  var window = ecma.window; // scope

{#./_sizzle.js}

  /**
   * @function selectElements
   * @function sizzle
   */

  _package.selectElements =
  _package.sizzle = window.Sizzle;

  /**
   * @function selectElement
   */
  _package.selectElement = function( selector, context, results, seed ) {
    return _package.sizzle.apply(_package.sizzle, arguments)[0];
  };

});
