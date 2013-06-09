/** @namespace fx.effects */
ECMAScript.Extend('fx.effects', function (ecma) {

  var CEffect = ecma.fx.Effect;

  var proto = ecma.lang.createPrototype(CEffect);

  /**
   * @class Opacify
   */

  this.Opacify = function (elem, beg, end, duration) {
    this.elem = ecma.dom.getElement(elem);
    this.begin = beg;
    this.end = end;
    var delta = this.getDelta();
    CEffect.apply(this, [delta, duration]);
  };

  this.Opacify.prototype = proto;

  /**
   * @function getDelta
   */

  proto.getDelta = function () {
    this.dir = this.begin > this.end ? -1 : 1;
    return Math.abs(this.dir > 0 ? this.end - this.begin : this.end - this.begin);
  };

  /**
   * @function draw
   */

  proto.draw = function (action, progress) {
    var d = this.getDelta() * progress.getProportion();
    var value = (d * this.dir) + this.begin;
    ////ecma.console.log('fx:setOpacity', ecma.dom.getXPath(this.elem), value);
    ecma.dom.setOpacity(this.elem, value);
  };

});
