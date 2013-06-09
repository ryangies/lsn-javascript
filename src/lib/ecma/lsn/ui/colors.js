/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  /**
   * @structure colors
   */

  this.colors = {};
  {#:for (name, value) in /res/palettes/lsn.hf/rgb}
  this.colors.{#name} = '{#value}';
  {#:end for}

});
