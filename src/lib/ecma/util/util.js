/**
 * @namespace util
 * Common utility functions.
 */

ECMAScript.Extend('util', function (ecma) {

  var _toString = Object.prototype.toString;

  /**
   * @function isDefined
   * @function defined
   * Return true unless the variable type is 'undefined'
   *  @param variable
   */

  this.isDefined =
  this.defined = function (unk) {
    return  unk === null                ? false :
            typeof(unk) === 'undefined' ? false :
                                          true;
  };

  /**
   * @function firstDefined
   * Return the first defined agument.
   */

  this.firstDefined = function (unk) {
    for (var i = 0; i < arguments.length; i++) {
      var unk = arguments[i];
      if (unk !== null && typeof(unk) !== 'undefined') {
        return unk;
      }
    }
  };

  /**
   * @function isa
   * Is the unkown an instance of (or derived from) this class
   *
   *  isa(unk, klass);
   *
   * @param unk     <Any>           The unknown
   * @param klass   <Function>      The constructor class
   *
   * Objects with multiple inheritence created using the function
   * L<ecma.lang.createPrototype> will have a prototype member named
   * C<__constructors__>, which will be inspected if it exists.
   */

  this.isa = function (unk, klass) {
    try {
      if (!unk) return false;
      if (unk instanceof klass) return true;
      var ctors = unk.__constructors__;
      if (ctors) {
        for (var i = 0, ctor; ctor = ctors[i]; i++) {
          if (ctor === klass) return true;
        }
      }
    } catch (ex) {
      return false;
    }
    return false;
  };

  /**
   * @function isString
   * Is the unknown a string?
   */

  this.isString = function (unk) {
    return _toString.call(unk) == '[object String]';
  };

  /**
   * @function isObject
   * Is the unknown a JavaScript object?  Note that arrays are objects.
   *
   *  isObject(unk)
   *
   * @param unk <Any> The unknown
   */

  this.isObject = function (unk) {
    return unk && unk.constructor && typeof(unk) == 'object';
  };

  /**
   * @function isFunction
   * Is the unknown a JavaScript function?
   *
   *  bool = ecma.util.isFunction(unk);
   *
   * @param unk <Any> The unknown
   */

  this.isFunction = function (unk) {
    return unk && _toString.call(unk) == '[object Function]';
  };

  /**
   * @function isCallback
   * Is the unknown a callback function which can be used by C<ecma.lang.callback>?
   *
   *  bool = ecma.util.isCallback(unk);
   *
   * @param unk <Any> The unknown
   */

  this.isCallback = function (unk) {
    return ecma.util.isFunction(unk) ||
      (ecma.util.isArray(unk) && ecma.util.isFunction(unk[0]));
  };

  /**
   * @function isArray
   * Is the unknown a pure JavaScript array?
   *
   *  isArray(unk)
   *
   * @param unk <Any> The unknown
   */

  // Array.isArray was introducted in JavaScript 1.8.5
  this.isArray = Array.isArray || function (unk) {
    return _toString.call(unk) == '[object Array]';
  };

  /**
   * @function isNumber
   * Is the unknown a `Number`?
   * @param unk <Any> The unknown
   */

  this.isNumber = function (unk) {
    return typeof(unk) == 'number';
  }

/**
 * This code (now named hasArrayFunctions) was used for isArray as it was 
 * thought one could derive from Array correctly. However this is not the case 
 * as setting C<a1[2] = 'z'> does not increase C<a1.length> nor does push or 
 * shift.
 *
 *  // Arrays created this way are both Arrays and Associative
 *  var A1 = function () {};
 *  var A2 = function () {};
 *  A1.prototype = js.lang.createPrototype(Array);
 *  A2.prototype = js.lang.createPrototype(A1);
 *  var a1 = new A1();
 *  var a2 = new A2();
 *  a1.foo = 'bar';
 *  a2.foo = 'bar';
 *  a1.push('x');
 *  a1.push('y');
 *  a1[2] = 'z';
 *  a2.push('x');
 *  a2.push('y');
 *  a2[2] = 'z';
 *  js.lang.assert(a1.join('') == 'xy'); // ! real Array would == 'xyz'
 *  js.lang.assert(a2.join('') == 'xy'); // ! real Array would == 'xyz'
 *  js.lang.assert(!js.util.isArray(a1));
 *  js.lang.assert(!js.util.isArray(a2));
 *  js.lang.assert(js.util.isAssociative(a1));
 *  js.lang.assert(js.util.isAssociative(a2));
 *

  this.hasArrayFunctions = function (unk) {
    try {
      var ctors = unk.__constructors__;
      if (ctors) {
        for (var i = 0, ctor; ctor = ctors[i]; i++) {
          for (var j = 0; j < ECMAScript.Instances.length; j++) {
            if (ctor === ECMAScript.Instances[j].window.Array) return true;
          }
        }
        return false;
      } else {
        return _isArray(unk);
      }
    } catch (ex) {
      return false;
    }
  };

snipsnap
    if (!ecma.util.isObject(unk)) return false;
    // unk.constructor.prototype.length is defined on strings (so we use push 
    // instead)
    return typeof(unk.constructor.prototype.push) == 'function';
*
*/

  /**
   * @function isAssociative
   * Is the unknown an associative array?  Meaning an object which is not
   * an array.
   *
   *  isAssociative(unk)
   *
   * @param unk <Any> The unknown
   */

  this.isAssociative = function (unk) {
    if (!ecma.util.isObject(unk)) return false;
    return unk.__constructors__
      ? true
      : !ecma.util.isArray(unk);
  };

  /**
   * @function args
   * Create an Array comprised of Function.arguments elements.
   *  @param args arguments object
   */

  this.args = function (args) {
    if (!args) return [];
    var len = args.length || 0;
    var result = new Array(len);
    while (len--) result[len] = args[len];
    return result;
  };

  /**
   * @function use
   * Export variables into the given namespace.
   *  ecma.util.use(object, object);
   * For example:
   *  ecma.util.use(this, ecma.dom.constants);
   * Would make the L<ecma.dom.constants> available as C<this.____>.
   */

  this.use = function () {
    var args = this.args(arguments);
    var scope = args.shift();
    for (var i = 0; i < args.length; i++) {
      var ns = args[i];
      for (var name in ns) {
        if (ecma.util.defined(scope[name])) {
          throw new Error("'" + name + "' is already defined in this scope: " + scope);
        }
        scope[name] = ns[name];
      }
    }
  };

  /**
   * @function evar
   * Evaluate a variable.
   *
   *  var href = evar('document.location.href');
   *  var href = evar('this.location.href', document); // with scope
   *
   * Convenience method which eats the traversal exceptions which occur while
   * accessing the value.
   *
   * This line:
   *    evar('document.documentElement.clientWidth');
   * is eqivalent to:
   *    document.documentElement ? this.doc.documentElement.clientWidth : undefined;
   */

  this.evar = function (unk, scope) {
    if (!unk || typeof(unk) != 'string') throw new Error('Provide a String');
    if (!unk.match(/[A-Za-z_\$][A-Za-z_\$\.0-9]+/)) throw new Error('Illegal object address');
    var result = undefined;
    try {
      if (scope) {
        var func = function () { return eval(unk); }
        result = func.apply(scope, []);
      } else {
        result = eval(unk);
      }
    } catch (ex) {
      // An exception indicates the value is not defined
      return null;
    }
    return result;
  };

  /**
   * @function asInt
   * Integer representation of the provided unkown
   *
   *  @param unk The unknown
   *  @param gez true|false, only return a value greater-than or equal to zero
   *
   = NaN is returned as 0.
   = When 'gez' is in effect, negative numbers are returned as 0.
   */

  this.asInt = function (unk, gez) {
    var i = unk;
    if (typeof(unk) == 'string') {
      i = parseInt(unk.replace("\w", ""));
    } else {
      i = parseInt(unk);
    }
    return isNaN(i) ? 0 : gez && i < 0 ? 0 : i;
  };

  /**
   * @function randomId
   * Produce a random identifier.
   * 
   *  var id = randomId(); // id is ~ 8234
   *  var id = randomId('tbl_'); // id is ~ tbl_8234
   *  var id = randomId('tbl_', 100); // id is ~ tbl_82 (no greater than 99)
   *
   *  @param prefix
   *  @param multiplier (default 100,000)
   */

  this.randomId = function (prefix, multiplier) {
    if (!multiplier) multiplier = 100000;
    var w = new String(multiplier).length;
    var n = ecma.util.pad(Math.floor(Math.random()*multiplier), w);
    return prefix ? prefix + n : n;
  };

  /**
   * @function incrementalId
   * Produce an incremented identifier for a given prefix.
   *
   *  var id = ecma.util.incrementalId(prefix, width);
   *
   * Where:
   *
   * @param id    <String> Identifier prefix (and key)
   * @param width <Number> Number width, zero padded (optional)
   *
   * Identifiers begin at 1.
   *
   * Example:
   *
   *  var id1 = ecma.util.incrementalId('foo');
   *  var id2 = ecma.util.incrementalId('foo');
   *  var id3 = ecma.util.incrementalId('foo', 3);
   *
   *  foo1
   *  foo2
   *  foo003
   */

  var _incrementalIdMap = new Object();

  this.incrementalId = function (prefix, width) {
    var idx = _incrementalIdMap[prefix];
    idx = _incrementalIdMap[prefix] = idx == null ? 1 : idx + 1;
    return width ? prefix + ecma.util.pad(idx, width) : prefix + idx;
  };

  /**
   * @function rand4
   *
   * Create a 4-character hex identifier. For example:
   *
   *  96df
   *
   * See also L<rand8>
   * See also L<createUUID>, aka L<createGUID>.
   */

  var rand4 =
  this.rand4 = function () {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  /**
   * @function rand8
   *
   * Create an 8-character hex identifier. For example:
   *
   *  6ebeaca4
   *
   * See also L<createUUID>, aka L<createGUID>.
   */

  this.rand8 = function () {
    return rand4() + rand4();
  };

  /**
   * @function createUUID
   * @function createGUID
   *
   * Create a 36-character hex identifier. For example:
   *
   *  6ebeaca4-96df-b9d1-331f-c07fa13d7167
   */

  this.createUUID =
  this.createGUID = function () {
    return [
      rand4() + rand4(),
      rand4(),
      rand4(),
      rand4(),
      rand4() + rand4() + rand4()
    ].join('-');
  };

  /**
   * @function pad
   * Return a padded string of the specified width.
   *
   *  var str = ecma.util.pad(src, width);
   *  var str = ecma.util.pad(src, width, chr);
   *  var str = ecma.util.pad(src, width, chr, rtl);
   *
   * Where:
   *
   *  @param src <String|Number> The source value to pad
   *  @param width <Number> The desired width (1 < width < 100)
   *  @param chr <String> The padding character (default is 0)
   *  @param rtl <Boolean> Right-to-left? (default is false)
   *
   * If the source length is greater than the specified width, it is returned
   * without modification.
   *
   * For example:
   *
   *  ecma.util.pad('a', 3);              // 00a
   *  ecma.util.pad('a', 3, '-');         // --a
   *  ecma.util.pad('a', 3, '-', true);   // a--
   */

  this.pad = function (src, width, chr, rtl) {
    if (!chr) chr = '0';
    if (!rtl) rtl = false;
    if (width > 100) throw new ecma.error.IllegalArg('width');
    if (width < 1) throw new ecma.error.IllegalArg('width');
    if (chr.length != 1) throw new ecma.error.IllegalArg('chr');
    var len = new String(src).length;
    if (len > width) return src;
    var result = rtl ? '' + src : '';
    for (var i = len; i < width; i++) {
       result += chr;
    }
    return rtl ? result : result + src;
  };

  /**
   * @function grep
   * Return an array of matching items.
   *  var result = grep (value, list);
   *  var result = grep (function, list);
   *
   * Example using match function:
   *
   *  function isPrime (num) { ... }
   *  var primes =  grep (isPrime, [1, 2, 3, 4]);
   *
   * Example using match value:
   *
   *  var value =  grep ('abc', ['abc', 'def', 'ghi']);
   */

  this.grep = function (target, a) {
    if (!a || !ecma.util.defined(a.length)) return null;
    var result = [];
    var func = target instanceof Function
      ? target
      : function (a) {return a == target;};
    for (var i = 0; i < a.length; i++) {
      if (func(a[i])) result.push(a[i]);
    }
    return result.length > 0 ? result : null;
  };

  /**
   * @function overlay
   * Recursively copy members of one object to another by key.
   *  @param dest object
   *  @param src object
   *  @param ... more sources
   *
   *  var dest = {a:1};
   *  overlay(dest, {b:2}, {c:3});
   *  // dest is now {a:1, b:2, c:3}
   */

  this.overlay = function () {
    var args = ecma.util.args(arguments);
    var dest = args.shift();
    if (typeof(dest) != 'object') throw new Error('invalid argument');
    for (var i = 0; i < args.length; i++) {
      var src = args[i];
      if (!ecma.util.defined(src)) continue;
      if (typeof(dest) != typeof(src)) throw new Error('type mismatch');
      if (dest === src) continue;
      for (var k in src) {
        if (typeof(dest[k]) == 'function') {
          dest[k] = src[k];
        } else if (typeof(dest[k]) == 'object') {
          this.overlay(dest[k], src[k]);
        } else {
          dest[k] = src[k];
        }
      }
    }
    return dest;
  };

  /**
   * @function clone
   * Convenience method for overlaying properties into an empty object.
   */

  this.clone = function (arg1) {
    var args = ecma.util.args(arguments);
    if (typeof(arg1) != 'object') throw new Error('invalid argument');
    var obj = ecma.util.isAssociative(arg1) ? {} : [];
    args.unshift(obj);
    return ecma.util.overlay.apply(this, args);
  };

  /**
   * @function keys
   * Create an array of the Object's keys.
   *  @param obj <Object>
   */

  this.keys = function (obj) {
    if (!(obj instanceof Object)) return null;
    var result = [];
    for (var k in obj) {
      result.push(k);
    }
    return result;
  };

  /**
   * @function values
   * Create an array of the Object's values.
   *  @param obj <Object>
   */

  this.values = function (obj) {
    if (!(obj instanceof Object)) return null;
    var result = [];
    for (var k in obj) {
      result.push(obj[k]);
    }
    return result;
  };

  /**
   * @function step
   * Step carefully over each item in an array, applying the callback.
   *
   *  ecma.util.step(arr, func);
   *  ecma.util.step(arr, func, scope);
   *  ecma.util.step(arr, func, scope, args);
   *
   * The first parameter passed to C<func> is always the array item of the
   * current step.
   *
   * Exceptions which are thrown by C<func> are caught and stored in an array.
   * After all items have been stepped through, a L<ecma.error.Multiple>
   * exception is thrown if necessary.  This "safe-stepping" is the purpose
   * of this function.
   */

  this.step = function (arr, func, scope, args) {
    if (!ecma.util.isArray(arr)) throw new ecma.error.IllegalArg('arr');
    if (!ecma.util.isFunction(func)) throw new ecma.error.IllegalArg('func');
    if (!args) args = [];
    if (!ecma.util.isFunction(args.shift)) args = ecma.util.args(args);
    if (!ecma.util.isArray(args)) throw new ecma.error.IllegalArg('args');
    var errors = [];
    for (var i = 0; i < arr.length; i++) {
      try {
        args.unshift(arr[i]);
        func.apply(scope, args);
      } catch (ex) {
        ecma.error.reportError(ex);
        errors.push(ex);
      } finally {
        args.shift();
        continue;
      }
    }
    if (errors.length) {
      throw errors.length > 1
        ? new ecma.error.Multiple(errors)
        : errors[0];
    }
  };

  /**
   * @function associateArrays
   *
   * Create an object from two arrays
   *
   *  @param values <Array> Values for the object
   *  @param names <Array>  Names (or keys) for the object
   *
   * For example:
   *
   *  a1 = ['Alpha', 'Bravo', 'Charlie'];
   *  a2 = ['a', 'b', 'c'];
   *  o = ecma.util.associateArrays(a1, a2);
   *
   * produces:
   *
   *  o = {
   *    'a': 'Alpha',
   *    'b': 'Bravo',
   *    'c': 'Charlie'
   *  };
   *
   */

  this.associateArrays = function (values, names) {
    var result = new Object();
    if (!(values && names)) return result;
    for (var i = 0; i < names.length && i < values.length; i++) {
      result[names[i]] = values[i];
    }
    return result;
  };

});
