/**
 * @namespace lang
 * ECMA language.
 */

ECMAScript.Extend('lang', function (ecma) {

  /**
   * @function createPrototype
   * Return an instance of a proxied constructor.
   *
   * Allows one to use the basic ECMAScript inheritance model without
   * calling the base class' constructor.
   *
   *  var BaseClass = function () { ... };
   *  var MyClass = function () { ... };
   *  MyClass.prototype = js.lang.createPrototype(BaseClass);
   *
   * Also implements a multiple inheritence model.  With single inheritence,
   * the C<instanceof> operator will work as expected.  With multiple
   * inhertience, only the first base class is recognized.  As such,
   * L<ecma.util.isa> must be used to intergate all bases.
   *
   *  var BaseClass1 = function () { ... };
   *  var BaseClass2 = function () { ... };
   *  var MyClass = function () { ... };
   *  MyClass.prototype = js.lang.createPrototype(BaseClass1, BaseClass2);
   *  var myObj = new MyClass();
   *  ecma.lang.assert(myObj instanceof BaseClass1);        // Okay
   *  ecma.lang.assert(myObj instanceof BaseClass2);        // Wrong
   *  ecma.lang.assert(ecma.util.isa(myObj, BaseClass2));   // Correct
   *
   * When a duplicate base class is detected it will be ignored. For instance:
   *
   *  var A = function () {};
   *  A.prototype = ecma.lang.createPrototype();
   *
   *  var B = function () {};
   *  B.prototype = ecma.lang.createPrototype(A);
   *
   *  var C = function () {};
   *  C.prototype = ecma.lang.createPrototype(B, A);  // A is ignored
   *
   * However this only works when the methods have not yet been overlayed on to
   * the final prototype. For example:
   *
   *  var C = function () {};
   *  C.prototype = ecma.lang.createPrototype(A, B);  // A is NOT ignored
   *
   * In the above A is first integrated, then B comes along. However B is
   * already a composite which includes A's methods. TODO Scan B to see if it 
   * isa A, then prune A if so.
   *
   */

{#:if DEBUG && VERBOSE}
  function _funcname (func) {
    var type = typeof(func);
    if (type != 'function') return type;
    if (func.name) return func.name;
    var str = func.toString();
    var match = str.match(/function[\s]*([^(]*)[\s*]\(/, 1);
    return match[1] || '(?)';
  }
{#:end if}

  /**
   * @private:function _cchain
   * Extract all constuctors and their underlying constructors.
   */

  function _cchain (ctors, result, depth) {
    if (depth > 100) {
      throw new Error('Deep recursion while exctracting constructors');
    }
    for (var i = 0; i < ctors.length; i++) {
      var ctor = ctors[i];
      if (typeof(ctor) != 'function') {
        throw new Error ('Constructor is not a function');
      }
{#:if DEBUG && VERBOSE}
      var ctorName = _funcname(ctor);
      ecma.console.log('Inspecting', depth, ctorName);
{#:end if}
      for (var j = 0; j < result.length; j++) {
        if (result[j] === ctor) {
{#:if DEBUG && VERBOSE}
          ecma.console.log(' -Skipping duplicate class: ', ctorName);
{#:end if}
          ctor = null;
          break;
        }
      }
      if (!ctor) continue;
      if (ctor.prototype.__constructors__) {
        _cchain(ctor.prototype.__constructors__, result, ++depth);
      }
      if (ctor) result.push(ctor);
    }
    return result;
  }

  this.createPrototype = function (ctor) {
    var methods = null;
    if (!arguments.length) {
      // No inheritence
      methods = new Object();
    } else {
      var ctors = _cchain(arguments, [], 0);
      for (var i = 0, ctor; ctor = ctors[i]; i++) {
        var Class = function () {};
        Class.prototype = ctor.prototype;
        if (methods) {
          var stub = new Class();
          for (var k in stub) {
            if (k == '__constructors__') continue;
            methods[k] = stub[k];
          }
        } else {
          methods = new Class(); // call new to comply with instanceof
        }
      }
      methods.__constructors__ = ctors;
    }
    return methods;
  };

  /**
   * @function hasMethods
   *
   * Test a given object for the presence of member functions. This is
   * related to supporting an interface.
   *
   *  @param obj <Object> That which is to be queried
   *  @param methods <Array> Names of members which must be functions
   *
   * Example:
   *
   *  var obj = new Object();
   *  ecma.lang.hasMethods(obj, ['toString', 'hasOwnProperty']); // returns true
   *  ecma.lang.hasMethods(obj, ['apply', 'toString']); // returns false
   */

  this.hasMethods = function (obj, methods) {
    ///ecma.lang.assert(ecma.util.isArray(methods));
    ///ecma.lang.assert(ecma.util.isObject(obj));
    for (var i = 0; i < methods.length; i++) {
      var methodName = methods[i];
      if (!methodName in obj || typeof(obj[methodName]) != 'function') {
        return false;
      }
    }
    return true;
  };

  /**
   * @function createConstructor
   * Wrapper which calls the class' construct function.
   *
   * A class' constructor function should not be a member of its prototype
   * if you want it to be a base-class of a multiply-inhertited sub-class.
   *
   * Example:
   *
   *  CAlpha = ecma.lang.createConstructor();
   *  CAlpha.prototype = {
   *    construct: function (arg1) {
   *      this.value = arg1;
   *    },
   *    toString: function () {
   *      return '[A] ' + this.value;
   *    }
   *  };
   *
   *  CBravo = ecma.lang.createConstructor(CAlpha);
   *  CBravo.prototype.toString = function () {
   *    return '[B] ' + this.value;
   *  };
   */

  this.createConstructor = function () {
    var c = function Constructor () {
      if (this.construct) this.construct.apply(this, arguments);
    };
    c.prototype = ecma.lang.createPrototype.apply(this, arguments);
    return c;
  };

  /**
   * @function createObject
   *
   * Creates a new instance of the specified class.  Behaves as C<apply> does,
   * i.e., passing the C<args> array as arguments to the class constructor.
   *
   * @param klass <Function> Constructor function
   * @param args <Array> Arguments
   *
   *  function Point2D (x, y) {
   *    this.x = x;
   *    this.y = y;
   *  };
   *
   *  function Point3D (x, y, z) {
   *    this.x = x;
   *    this.y = y;
   *    this.z = z;
   *  };
   *
   *  function createPoint () {
   *    if (arguments.length == 3)
   *      return ecma.lang.createObject(Point3D, arguments);
   *    if (arguments.length == 2)
   *      return ecma.lang.createObject(Point2D, arguments);
   *    throw new Exception();
   *  }
   */

  this.createObject = function (klass, args) {
    var ctor = function () {};
    ctor.prototype = klass.prototype;
    var obj = new ctor();
    klass.apply(obj, args || []);
    return obj;
  };

  /**
   * @function createCallback
   * Create a callback function.
   *
   * @param func <Function> to call back
   * @param scope <Scope> to apply the callback
   * @param args <Array> (optional) arguments which will be passed *after* the caller's.
   *
   *  var cb = ecma.lang.createCallback(this.refresh, this, [arg1, arg2]);
   *
   * Note that window.setTimeout and window.setInterval pass the number of
   * seconds late as the first argument.  To avoid this, use L<ecma.dom.setTimeout>
   * and L<ecma.dom.setInterval>.
   */

  this.createCallback = function () {
    var cbarr = ecma.lang.createCallbackArray.apply(null, arguments);
    var func = cbarr[0];
    var scope = cbarr[1];
    var args = cbarr[2];
    return function () {
      var argx = ecma.util.args(arguments);
      return func.apply(scope || this, argx.concat(args));
    }
  };

  /**
   * @function createCallbackArray
   * Create a callback array.
   *
   *  [func, scope, args] = ecma.lang.createCallbackArray(func, scope, args);
   *
   * This method unwraps C<func> when it is already a callback array.
   *
   * See L<ecma.lang.callback>
   */

  this.createCallbackArray = function (func, scope, args) {
    if (!args) args = [];
    if (!func) throw new Error('Missing callback function (or array)');
    // Note, ecma.util.isArray is not used, as it (more specifically 
    // `Array.isArray`) will return false when func is an `arguments` object.
    if (typeof(func) != 'function' && func.length) {
      if (func[2]) args = args.concat(func[2]);
      scope = func[1] || scope;
      func = func[0];
    }
    return [func, scope, args];
  }

  /**
   * @function callback
   * Apply a callback function.
   *
   *  var result = ecma.lang.callback(func);
   *  var result = ecma.lang.callback(func, scope);
   *  var result = ecma.lang.callback(func, scope, args);
   *
   * @param func    <Function|Array> Callback function L<1>
   * @param scope   <Object> Default scope
   * @param args    <Array> Arguments L<2>
   *
   * N<1> When C<func> is an array, it is taken to conform to this standard
   * structure:
   *
   *  func[0]       <Function>  Callback function
   *  func[1]       <Object>    Scope (optional) L<2>
   *  func[2]       <Array>     Arguments (optional) L<3>
   *
   * This allows one to pass around callbacks as arrays, then use this method to
   * apply them.
   *
   * N<2> If the inner scope is not defined, the outer is used.
   *
   * N<3> The parameters in the outer C<args> array precede those in the inner
   * C<func> array should C<func> be an array.  This is done as the inner
   * arguments are caller-defined, and hence more variable.
   *
   # Example
   *
   *  function MyClass () {};
   *  MyClass.prototype = {
   *    'run': function (cb) {
   *      // do something
   *      ecma.lang.callback(cb, this, [1, 2, 3]);
   *    }
   *  };
   *
   *  function onComplete () {
   *    for (var i = 0; i < arguments.length; i++) {
   *      ecma.console.log('arguments [' + i + '] = ' + arguments[i]);
   *    }
   *  }
   *
   *  var obj = new MyClass();
   #  obj.run([onComplete, this, ['a', 'b', 'c']])
   *
   * Will output:
   *
   *  arguments[0] = 1
   *  arguments[1] = 2
   *  arguments[2] = 3
   *  arguments[3] = a
   *  arguments[4] = b
   *  arguments[5] = c
   *
   * Additionally, the calling code could also:
   *
   #  obj.run(onComplete);
   *
   * Which would output:
   *
   *  arguments[0] = 1
   *  arguments[1] = 2
   *  arguments[2] = 3
   * 
   * Or, say it creates its own callback function:
   *
   *  var cb = ecma.lang.createCallback(onComplete, this, ['x', 'y']);
   #  obj.run(cb);
   *
   * Which would output:
   *
   *  arguments[0] = 1
   *  arguments[1] = 2
   *  arguments[2] = 3
   *  arguments[3] = x
   *  arguments[4] = y
   *
   */

  this.callback = function (func, scope, args) {
    var cbarr = ecma.lang.createCallbackArray(func, scope, args);
    return cbarr[0] ? cbarr[0].apply(cbarr[1], cbarr[2]) : undefined;
  };

  /**
   * @function assert
   * Throw an exception if expression is false.
   */

  this.assert = function (expression, msg) {
    if (expression) return;
    if (!msg) msg = 'Assertion failed';
    var ex = new ecma.error.Assertion(msg);
    ecma.error.reportError(ex); // For good measure
    throw ex;
  };

  /**
   * @function createAbstractFunction
   * Creates a function which throws an exception when called.
   *  this.method = ecma.lang.createAbstractFunction();
   */

  this.createAbstractFunction = function () {
    return function () {
      throw new Error('Abstract function not implemented');
    };
  };

  /**
   * @function createProxyFunction
   *
   *  real = {
   *    'invoke': function () { },
   *    'toString': function () { }
   *  };
   *
   *  facade = {};
   *
   *  // Create entries in facade which forward to real
   *  js.lang.createProxyFunction('invoke', facade, real);
   *  js.lang.createProxyFunction('toString', facade, real);
   *
   *  // Or, pass all function names at once
   *  js.lang.createProxyFunction(['invoke', 'toString'], facade, real);
   *
   */

  this.createProxyFunction = function (name, fromObject, toObject) {
    if (ecma.util.isArray(name)) {
      var result = [];
      for (var i = 0; i < name.length; i++) {
        result.push(
          ecma.lang.createProxyFunction(name[i], fromObject, toObject)
        );
      }
      return result;
    }
    return fromObject[name] = function Proxy () {
      return toObject[name].apply(toObject, arguments);
    };
  };

});

/** @namespace lang */

ECMAScript.Extend('lang', function (ecma) {

  /**
   * @deprecated Constructor (Use ecma.lang.createConstructor)
   * @deprecated Callback (Use ecma.lang.createCallback)
   * @deprecated Methods (Use ecma.lang.createPrototype)
   * @deprecated createMethods (Use ecma.lang.createPrototype)
   */

  this.Constructor = ecma.lang.createConstructor;
  this.Callback = ecma.lang.createCallback;
  this.Methods = ecma.lang.createPrototype;
  this.createMethods = ecma.lang.createPrototype;

});
