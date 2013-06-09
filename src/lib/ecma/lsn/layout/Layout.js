/** @namespace lsn.layout */
ECMAScript.Extend('lsn.layout', function (ecma) {

  var CArea = ecma.lsn.layout.Area;

  /**
   * @class Layout
   */

  this.Layout = function (opts) {
    CArea.apply(this, [0, null, 1, opts]);
  };

  var Layout =
  this.Layout.prototype = ecma.lang.createPrototype(
    CArea
  );

  Layout.getRuleRegion = function () {
    return this.getBoundingBox();
  };

  Layout.setRegion = function (region) {
    this.region = this.cloneRegion(region);
    this.region.top += this.gap.top;
    this.region.left += this.gap.left;
    this.region.width -= this.gap.width;
    this.region.height -= this.gap.height;
    this.updateRule();
    return this.getRegion();
  };

});
