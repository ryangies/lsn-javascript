ECMAScript.Extend('fx.effects', function (ecma) {

  var CEffect = ecma.fx.Effect;

  var proto = ecma.lang.createPrototype(CEffect);

  this.Combine = function () {
    CEffect.apply(this, [delta, duration]);
  };

  this.Combine.prototype = proto;

  proto.addEffect = function (arg1) {
    var effect = ecma.util.isObject(arg1)
      ? arg1
      : ecma.fx.createEffect.apply(null, arguments);
    this.effects.push(effect)
    return effect;
  };

  proto.removeEffect = function (effect) {
    var idx = -1;
    for (var i = 0; i < this.effects.length; i++) {
      if (this.effects[i] === effect) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      var effect = this.effects[idx];
      effect.removeAnimator();
      this.effects.splice(idx, 1);
    }
  };

  proto.setAnimator = function (ani) {
    CEffect.prototype.setAnimator.apply(this, arguments);
    for (var i = 0, effect; effect = this.effects[i]; i++) {
      effect.setAnimator(ani);
    }
  }

  proto.draw = function (action, progress) {
  };

});

