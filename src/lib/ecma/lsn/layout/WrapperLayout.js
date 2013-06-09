/** @namespace lsn.layout */
ECMAScript.Extend('lsn.layout', function (ecma) {

  var CPage = ecma.lsn.ui.Page;
  var CArea = ecma.lsn.layout.Area;

  /**
   * @class WrapperLayout
   *
   * Required 'wrapper' option which specifies wrapper
   */

  this.WrapperLayout = function (opts) {
    var options = ecma.util.overlay({'structure':'wrap'}, opts);
    this.pgRefreshRate = 64; // Overrides CPage
    CArea.apply(this, [0, null, 1, options]);
    CPage.apply(this);
  };

  var WrapperLayout =
  this.WrapperLayout.prototype = ecma.lang.createPrototype(
    CPage,
    CArea
  );

  WrapperLayout.onPageLoad = function (event) {
    this.initialize();
    var region = js.dom.getElementPosition(this.wrapperElement);
    this.update(region);
  };

  WrapperLayout.onPageResize = function (event) {
    var vp = this.getViewport();
    var w = vp.delta.width;
    var h = vp.delta.height;
    this.region.width += w;
    this.region.height += h;
    this.updateRule();
    this.propagate();
  };

  WrapperLayout.initialize = function () {
    CArea.prototype.initialize.call(this);
    this.wrapperElement = js.dom.getElement(this.options.wrapper);
  };

  WrapperLayout.getRuleRegion = function () {
    return this.getBoundingBox();
  };

  WrapperLayout.setRegion = function (region) {
    this.region = this.cloneRegion(region);
    this.region.top += this.gap.top;
    this.region.left += this.gap.left;
    this.region.width -= this.gap.width;
    this.region.height -= this.gap.height;
    this.updateRule();
    return this.getRegion();
  };

  WrapperLayout.createStyles = function () {
    for (var i = 0, area; area = this.splits[i]; i++) {
      area.createStyles();
    }
  };

});
