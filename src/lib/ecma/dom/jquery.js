/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @function query
   * Refernce to the C<jQuery> global object.
   */

  this.query = jQuery ? jQuery.noConflict() : null;

});
