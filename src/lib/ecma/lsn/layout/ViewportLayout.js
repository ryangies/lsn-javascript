/** @namespace lsn.layout */
ECMAScript.Extend('lsn.layout', function (ecma) {

  var CPage = ecma.lsn.ui.Page;
  var CArea = ecma.lsn.layout.Area;

  /**
   * @class ViewportLayout
   */

  this.ViewportLayout = function (opts) {
    CPage.apply(this);
    CArea.apply(this, [0, 'canvas', 1, opts]);
    this.ruleName = 'html body'; // Overrides CArea
    this.pgRefreshRate = 64; // Overrides CPage
    this.resizeRules = []; // Self-adjusting rules
  };

  var ViewportLayout =
  this.ViewportLayout.prototype = ecma.lang.createPrototype(
    CPage,
    CArea
  );

  ViewportLayout.onPageLoad = function (event) {
    this.initialize();
    var vp = this.getViewport();
    this.addResizeRule('html', {
      'width': vp.width,
      'height': vp.height
    });
    this.update(vp);
  };

  ViewportLayout.onPageResize = function (event) {
    var vp = this.getViewport();
    var w = vp.delta.width;
    var h = vp.delta.height;
    for (var i = 0, rule; rule = this.resizeRules[i]; i++) {
      rule.update(w, h);
    }
    this.region.width += w;
    this.region.height += h;
    this.updateRule();
    this.propagate();
  };

  ViewportLayout.getRuleRegion = function () {
    return this.getBoundingBox();
  };

  ViewportLayout.setRegion = function (region) {
    this.region = this.cloneRegion(region);
    this.region.top += this.gap.top;
    this.region.left += this.gap.left;
    this.region.width -= this.gap.width;
    this.region.height -= this.gap.height;
    this.updateRule();
    return this.getRegion();
  };

  ViewportLayout.createStyles = function () {
    ecma.lsn.layout.css.createRule('html', {
      'margin': '0',
      'padding': '0',
      'position': 'absolute',
      'overflow': 'hidden',
      'top': '0',
      'left': '0'
    })
    ecma.lsn.layout.css.createRule('html body', {
      'margin': '0',
      'padding': '0',
      'position': 'absolute'
    });
    for (var i = 0, area; area = this.splits[i]; i++) {
      area.createStyles();
    }
  };

  ViewportLayout.addResizeRule = function (name, values) {
    var rule = new ecma.lsn.layout.ResizeRule(name, values);
    this.resizeRules.push(rule);
    return rule;
  };

});
