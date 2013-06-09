/**
 * @namespace error
 *
 * XXX Depricated. Instead, use:
 *
 *  throw new ecma.error.Assertion(...);
 *  throw new ecma.error.MissingArg(...);
 *  throw new ecma.error.IllegalArg(...);
 *  throw new ecma.error.Multiple(...);
 *
 * This is a collection of exception strings.  What I'm seeing is that
 * throwing custom Error objects (error/programatic.js) does not yield
 * the same results as when simply throwing a string.
 *
 * The advantage of throwing an error object is that in a catch method
 * one can test for instanceof a particular exception class.
 *
 * The advantage of throwing a string is that the debugger* gives a
 * nice stack trace and points you to the line where the exception
 * was raised.  However, one has no choice but to interrogate the
 * exception string to find out what kind of error it is.  Which sucks
 * if you want to be say, multilingual.
 *
 * These strings are implemented as functions for two reasons: first,
 * it allows you to pass arguments so we can provide formatted messages;
 * and second, upgrading to custom Error-derived objects is an in-place
 * refactor (should call toString() so to ensure the return type is
 * the same).
 */

ECMAScript.Extend('error', function (ecma) {

  function _errprintf (str, args) {
    var result = new String(str);
    for (var i = 0; i < args.length; i++) {
      var param = new RegExp('\\$' + (i + 1));
      result = result.replace(param, args[i]);
    }
    result = result.replace(/\$@/, args.join(';'));
    return result;
  }

  function _errstr (str) {
    return function () {
      return new Error(_errprintf(str, ecma.util.args(arguments)));
    }
  }

  // TODO if ecma.platform.isEnglish()

  this.assertion = _errstr('Assertion failed');
  this['abstract'] = _errstr('Abstract function not implemented');
  this.illegalArgument = _errstr('Illegal argument: $1');
  this.missingArgument = _errstr('Missing argument: $1');
  this.multiple = _errstr('Multiple exceptions: $@');

});
