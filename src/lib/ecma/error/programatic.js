/** @namespace error */
ECMAScript.Extend('error', function (ecma) {

  /**
   * @class Assertion
   * Indicates an assertion failed.
   *
   *  throw new ecma.error.Assertion();
   *  throw new ecma.error.Assertion(message);
   */

  this.Assertion = function (message) {
    Error.apply(this);
    this.message = message;
  };
  this.Assertion.prototype = new Error();

  /**
   * @class MissingArg
   * Indicates a required function argument was not provided.
   *
   *  throw new ecma.error.MissingArg(name);
   *
   * Where C<name> indicates the name of the missing argument.
   */

  this.MissingArg = function (name) {
    this.message = 'Missing argument: ' + name;
  };
  this.MissingArg.prototype = new TypeError();

  /**
   * @class IllegalArg
   * Indicates a function argument is not correct.
   *
   *  throw new ecma.error.IllegalArg(name);
   *
   * Where C<name> indicates the name of the offending argument.
   */

  this.IllegalArg = function (name) {
    this.message = 'Illegal argument: ' + name;
  };
  this.IllegalArg.prototype = new TypeError();

  /**
   * @class Multiple
   * Indicates multiple exceptions occured.  Used in the case where throwing
   * each exception at the time would prevent critical code from executing.
   * For instance, when applying callback functions (listeners).
   *
   *  throw new ecma.error.Multiple(array);
   */

  this.Multiple = function (errors) {
    this.errors = errors;
    this.message = 'Multiple exceptions';
  };
  this.Multiple.prototype = new Error();
  this.Multiple.prototype.toString = function () {
    var result = this.message + "\n";
    for (var i = 0, ex; ex = this.errors[i]; i++) {
      result += '  Exception #' + i + ': ' + ex.toString() + "\n";
    }
    return result;
  };

});
