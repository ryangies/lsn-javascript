/**
 * @namespace console
 * Access to the client's console.  When no console is present calls are
 * silently ignored.
 */

ECMAScript.Extend('console', function (ecma) {

  var _package = this;

  /** Local stack of output consoles */
  var _consoles = [];

  /** Messages are spooled until an initial console is [attached and] flushed */
  var _spool = [];
  var _haveFlushed = false;

  /** 
   * @function tee
   * Add an output console to the stack. Output consoles are objects which
   * have C<log> and C<trace> methods.
   */
  _package.tee = function (console) {
    if (!console) throw new Error('Missing argument');
    _consoles.push(console);
  };

  /**
   * @function log
   * Log a message to all consoles
   */
  _package.log = function () {
    var args = ecma.util.args(arguments);
    var text = args.join(' ');
    if (!_haveFlushed) _spool.push(text);
    for (var i = 0, c; c = _consoles[i]; i++) {
      c.log(text);
    }
  };

  /**
   * @function trace
   * Log a trace message to all consoles
   */
  _package.trace = function () {
    if (arguments.length) ecma.console.log.apply(this, arguments);
    for (var i = 0, c; c = _consoles[i]; i++) {
      if (typeof(c.trace) == 'function') {
        c.trace();
      }
    }
  };

{#:for (name) in ('error', 'warn', 'info', 'dir', 'debug', 'trace')}
  /**
   * @function {#name}
   * Passed to all consoles
   */
  _package.{#name} = function (/*...*/) {
    for (var i = 0, c; c = _consoles[i]; i++) {
      var func = c.{#name};
      if (ecma.util.isFunction(func)) {
        func.apply(c, arguments);
      }
    }
  }

{#:end for}
  /**
   * @function flush
   * Output all log-history items.
   */
  _package.flush = function () {
    for (var i = 0; i < _spool.length; i++) {
      var text = _spool[i];
      for (var j = 0, c; c = _consoles[j]; j++) {
        c.log(text);
      }
      _spool = [];
      _haveFlushed = true;
    }
  };

});
