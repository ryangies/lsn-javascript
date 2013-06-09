/** @namespace fx.effects */
ECMAScript.Extend('fx.effects', function (ecma) {

  var CEffect = ecma.fx.Effect;

  var proto = ecma.lang.createPrototype(CEffect);

  /**
   * @class Style
   */

  this.Style = function (elem, attr, p1, p2, units, duration) {
    this.elem = ecma.dom.getElement(elem);
    this.attr = attr;
    this.units = units || '';
    this.end = p2;
    this.begin = p1;
    this.dir = this.begin > this.end ? -1 : 1;
    var delta = Math.abs(this.dir > 0 ? this.end - this.begin : this.end - this.begin);
    CEffect.apply(this, [delta, duration]);
  };

  this.Style.prototype = proto;

  proto.draw = function (action, progress) {
    var d = this.getDelta() * progress.getProportion();
    var value = (d * this.dir) + this.begin;
    ecma.dom.setStyle(this.elem, this.attr, value + this.units);
    //ecma.console.log(this.attr, value + this.units);
  };

});
