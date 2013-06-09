ECMAScript.Extend('fx.effects', function (ecma) {

  var CEffect = ecma.fx.Effect;

  var proto = ecma.lang.createPrototype(CEffect);

  this.Swap = function (attr, units, duration) {
    this.attr = attr;
    this.units = units || '';
    CEffect.apply(this, [0, duration]);
  };

  this.Swap.prototype = proto;

  proto.start = function (elem1, elem2, cb) {
    this.elem1 = ecma.dom.getElement(elem1);
    this.elem2 = ecma.dom.getElement(elem2);
    var p1 = ecma.dom.getStyle(elem1, this.attr);
    var p2 = ecma.dom.getStyle(elem2, this.attr);
    if (this.units) {
      p1 = p1.substr(0, p1.length - this.units.length);
      p2 = p2.substr(0, p2.length - this.units.length);
    }
    p1 = ecma.util.asInt(p1);
    p2 = ecma.util.asInt(p2);
    this.sum = p1 + p2;
    this.begin = p1;
    this.end = p2;
    this.dir = p1 > p2 ? -1 : 1;
    this.fxDelta = Math.abs(this.dir > 0 ? p2 - p1 : p2 - p1);
    CEffect.prototype.start.call(this, cb);
  };

  proto.draw = function (action, progress) {
    var d = this.getDelta() * progress.getProportion();
    var v1 = (d * this.dir) + this.begin;
    var v2 = (d * -this.dir) + this.end;
    ecma.dom.setStyle(this.elem1, this.attr, v1 + this.units);
    ecma.dom.setStyle(this.elem2, this.attr, v2 + this.units);
//  ecma.console.log('elem1', this.attr, v1 + this.units);
//  ecma.console.log('elem2', this.attr, v2 + this.units);
//  ecma.console.log('elems', this.attr, v1 + v2, this.units);
  };

});
