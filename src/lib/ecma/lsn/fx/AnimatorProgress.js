/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  var proto = {};

  /**
   * @class AnimatorProgress
   */

  this.AnimatorProgress = function (interval, duration) {
    this.interval = interval;
    this.duration = duration;
    this.last = this.now = this.begin = new Date();
  };

  this.AnimatorProgress.prototype = proto;

  /**
   * @function update
   */

  proto.update = function () {
    this.last = this.now;
    this.now = new Date();
  };

  /**
   * @function isComplete
   */

  proto.isComplete = function () {
    return this.duration && (this.getElapsed() >= this.duration);
  };

  /**
   * @function getLap
   */

  proto.getLap = function () {
    return this.now - this.last;
  };

  /**
   * @function getElapsed
   */

  proto.getElapsed = function () {
    return this.now - this.begin;
  };

  /**
   * @function getProportion
   */

  proto.getProportion = function () {
    var p = this.duration ? this.getElapsed() / this.duration : -1;
    return Math.min(p, 1);
  };

  /**
   * @function toString
   */

  proto.toString = function () {
    var result = [
      'proportion=' + this.getProportion(),
      'lap=' + this.getLap(),
      'elapsed=' + this.getElapsed(),
      'isComplete=' + this.isComplete()
    ]
    return result.join(', ');
  };

});
