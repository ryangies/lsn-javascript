/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  var proto = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @class Animator
   */

  this.Animator = function (interval, duration) {
    CActionDispatcher.apply(this);
    this.aniEvents = {};
    this.aniEffects = [];
    this.aniDuration = duration; // milliseconds
    this.aniInterval = interval || 25; // milliseconds
    this.aniBlocking = true;
    this.aniProgress = null;
  };

  this.Animator.prototype = proto;

  function next() {
    if (!this.isRunning()) return;
    if (this.aniBlocking) return;
    this.aniBlocking = true;
    this.aniProgress.update();
    try {
      if (this.aniProgress.isComplete()) {
        this.executeAction('last', this.aniProgress);
        this.stop();
      } else {
        this.executeAction('next', this.aniProgress);
      }
    } finally {
      this.aniBlocking = false;
    }
    return this;
  }

  /**
   * @function isRunning
   */

  proto.isRunning = function () {
    return this.aniEvents.iid && true;
  };

  /**
   * @function setDuration
   */

  proto.setDuration = function (duration) {
    if (this.isRunning()) throw new Error('Cannot update duration while running');
    this.aniDuration = duration;
  };

  /**
   * @function addEffect
   */

  proto.addEffect = function (arg1) {
    var effect = ecma.util.isObject(arg1)
      ? arg1
      : ecma.fx.createEffect.apply(null, arguments);
    effect.setAnimator(this);
    this.aniEffects.push(effect)
    return effect;
  };

  /**
   * @function removeEffect
   */

  proto.removeEffect = function (effect) {
    var idx = -1;
    for (var i = 0; i < this.aniEffects.length; i++) {
      if (this.aniEffects[i] === effect) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      var effect = this.aniEffects[idx];
      effect.removeAnimator();
      this.aniEffects.splice(idx, 1);
    }
  };

  /**
   * @function start
   */

  proto.start = function (cb) {
    /*
    for (var i = 0; i < this.aniEffects.length; i++) {
      this.aniEffects[i].setDuration(this.aniDuration);
    }
    */
    this.executeAction('start');
    this.aniProgress = new ecma.fx.AnimatorProgress(this.aniInterval, this.aniDuration);
    this.aniEvents.iid = ecma.dom.setInterval(next, this.aniInterval, this);
    this.executeAction('first', this.aniProgress);
    this.aniBlocking = false;
    return this;
  };

  /**
   * @function stop
   */

  proto.stop = function () {
    if (this.aniEvents.iid) {
      this.aniBlocking = true;
      ecma.dom.clearInterval(this.aniEvents.iid);
      delete this.aniEvents.iid;
      this.aniProgress = null;
      this.dispatchAction('stop');
    }
    return this;
  };

});
