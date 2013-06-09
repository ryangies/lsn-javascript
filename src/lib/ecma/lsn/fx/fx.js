/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  /**
   * @function createEffect
   */

  this.createEffect = function () {
    var args = ecma.util.args(arguments);
    var name = args.shift().toLowerCase();
    var klass = null;
    for (var key in ecma.fx.effects) {
      if (key.toLowerCase() == name) {
        klass = ecma.fx.effects[key];
        break;
      }
    }
    if (!klass) throw new Error('No such effect class');
    return ecma.lang.createObject(klass, args);
  };

  /**
   * @function perform
   */

  this.perform = function () {
    var args = ecma.util.args(arguments);
    var effect = ecma.fx.createEffect.apply(null, args.shift());
    var cb = args.length ? [ecma.fx.perform, null, args] : null;
    effect.start(cb);
  };

  /**
   * @structure effects
   * The namespace ecma.fx.effects is used as a structure.
   */

});
