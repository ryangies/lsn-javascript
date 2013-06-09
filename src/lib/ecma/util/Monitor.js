/** @namespace util */
ECMAScript.Extend('util', function (ecma) {

  var _package = this;
  var _proto;
  var _defaultParameters = {
    'min_interval': 250,
    'elapsed_multiplier': 0
  };

  var CParameters = ecma.impl.Parameters;

  /**
   * @class Monitor
   *
   * var monitor = new ecma.util.Monitor();
   * monitor.setParameters({
   *  'min_interval': 250,          // Minimum milliseconds between C<poll>s
   *  'elapsed_multiplier': 0       // Multiply the last C<poll>'s elapsed time times this to determine interval
   * });
   *
   * TOCONSIDER - `elapsed_multiplier` should be used in conjunction with an average
   * of the last (oh say, 5) `poll` elapsed-times.
   */

  _package.Monitor = function () {
    CParameters.apply(this);
    this.overlayParameters(_defaultParameters);
    this.timeoutId = null;
    this.targets = [];
    this.beginDate = null;
    this.elapsedTime = null;
  }

  _proto = _package.Monitor.prototype = ecma.lang.createPrototype(
    CParameters
  );

  _proto.addTarget = function (instance, method) {
    if (!instance) throw new Error('Missing target instance');
    if (!method) method = 'refresh';
    this.targets.push([instance, method]);
  };

  _proto.removeTarget = function (instance, method) {
    if (!instance) throw new Error('Missing target instance');
    if (!method) method = 'refresh';
    var len = this.targets.length;
    for (var i = 0; i < this.targets.length; i++) {
      var target = this.targets[i];
      var targetInstance = target[0];
      var targetMethod = target[1];
      if ((instance === targetInstance) && (method === targetMethod)) {
        this.targets.splice(i--, 1);
        break;
      }
    }
    return this.targets.length != len; // true when items removed
  };

  /**
   * @function start
   * @parameter bAsynchronous <Boolean> Caller must invoke L<resume> manually
   */

  _proto.start = function (bAsynchronous) {
    this.asynchronous = bAsynchronous ? true: false;
    this.stop();
    this.poll(!this.asynchronous);
  };

  _proto.stop = function () {
    this.beginDate = null;
    if (this.timeoutId === null) return;
    ecma.dom.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  };

  _proto.poll = function (bContinue) {
    this.beginDate = new Date();
    for (var i = 0; i < this.targets.length; i++) {
      var target = this.targets[i];
      var instance = target[0];
      var method = target[1];
      try {
        instance[method].apply(instance);
      } catch (ex) {
        ecma.console.log(ex);
      }
    }
    if (bContinue) this.resume();
  };

  _proto.getLastElapsed = function () {
    return this.elapsedTime;
  };

  _proto.resume = function () {
    if (this.beginDate === null) return; // Has been stopped (or not started)
    this.elapsedTime = new Date() - this.beginDate;
    var interval = Math.max(
      this.getParameter('min_interval'),
      (this.elapsedTime * this.getParameter('elapsed_multiplier'))
    );
    //js.console.log('elapsedTime', this.elapsedTime, 'interval', interval);
    this.timeoutId = ecma.dom.setTimeout(this.poll, interval, this, [!this.asynchronous]);
  };

});
