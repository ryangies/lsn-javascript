/** @namespace lsn.layout */
ECMAScript.Extend('lsn.layout', function (ecma) {

  /**
   * @class ResizeRule
   */

  this.ResizeRule = function (ruleName, values) {
    this.ruleName = ruleName;
    this.values = values;
    this.update(0, 0);
  };

  var ResizeRule = this.ResizeRule.prototype = ecma.lang.createPrototype();

  ResizeRule.adjust = function (prop, px) {
    this.values[prop] = (ecma.util.asInt(this.values[prop]) + px) + 'px';
  };

  ResizeRule.update = function (x, y) {
    this.values.width += x;
    this.values.height += y;
    ecma.lsn.layout.css.updateRule(this.ruleName, this.toCSS());
  };

  ResizeRule.toCSS = function () {
    var result = '';
    for (name in this.values) {
      result += name + ':' + this.values[name] + 'px;';
    }
    return result;
  };

});
