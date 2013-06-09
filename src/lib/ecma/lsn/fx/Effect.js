/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  var proto = {};

  /**
   * @class Effect
   */

  this.Effect = function (delta, duration) {
    this.fxDelta = delta;
    this.fxRate = 1000; // fallback
    this.fxInterval = 25; // for stand-alone playback
    this.fxDuration = duration;
    this.fxListeners = null;
    this.fxAnimator = null;
  };

  this.Effect.prototype= proto;

  /**
   * @function getDelta
   */

  proto.getDelta = function () {
    return this.fxDelta;
  };

  /**
   * @function getDuration
   */

  proto.getDuration = function () {
    return this.fxDuration;
  };

  /**
   * @function setDuration
   */

  proto.setDuration = function (duration) {
    return this.fxDuration = duration;
  };

  /**
   * @function start
   */

  proto.start = function (cb) {
    if (!this.fxDuration) {
      this.setDuration((this.getDelta() / this.fxRate) * 1000);
    }
    this.cb = cb;
    this.setAnimator(new ecma.fx.Animator(this.fxInterval, this.fxDuration));
    this.getAnimator().start();
    return this;
  };

  /**
   * @function stop
   */

  proto.stop = function () {
    this.removeAnimator();
  };

  /**
   * @function getAnimator
   */

  proto.getAnimator = function () {
    return this.fxAnimator;
  };

  /**
   * @function setAnimator
   */

  proto.setAnimator = function (ani) {
    if (this.fxListeners) this.removeAnimator();
    this.fxListeners = {};
    this.fxListeners.onFirst = ani.addActionListener('onFirst', this.onFirst, this);
    this.fxListeners.onNext = ani.addActionListener('onNext', this.onNext, this);
    this.fxListeners.onLast = ani.addActionListener('onLast', this.onLast, this);
    return this.fxAnimator = ani;
  };

  /**
   * @function removeAnimator
   */

  proto.removeAnimator = function () {
    try {
      this.fxListeners.onFirst.remove();
      this.fxListeners.onNext.remove();
      this.fxListeners.onLast.remove();
    } catch (ex) {
      // Not reported
    } finally {
      this.fxListeners = null;
      this.fxAnimator = null;
    }
  };

  /**
   * @function onFirst
   */

  proto.onFirst = function (action, progress) {
    this.draw(action, progress);
  };

  /**
   * @function onNext
   */

  proto.onNext = function (action, progress) {
    this.draw(action, progress);
  };

  /**
   * @function onLast
   */

  proto.onLast = function (action, progress) {
    this.draw(action, progress);
    if (this.cb) {
      var cb = this.cb;
      this.cb = null;
      ecma.lang.callback(cb);
    }
  };

  /**
   * @function draw
   */

  proto.draw = ecma.lang.createAbstractFunction();

});
