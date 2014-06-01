/**
 * @class ECMAScript
 *
 * Package definition and extension manager for ECMA scripts. This 
 * implementation considers each package to be an instantiable component
 * that is provided a pointer back to the library instance for which it is 
 * being created.  The intentions are to:
 *
 * 1. Provide management which enables one to division their code into logical
 * packages and avoid clobbering global variables.
 *
 * 2. Scope the C<window> and C<document> objects such that one may instantiate
 * the library to act upon a child window, i.e., an IFRAME, without changing
 * its dependencies nor incurring the cost of additional HTTP connections to
 * script files.
 *
 * Packages may contain local private variables, classes, and functions. 
 * Namespaces are extendable, allowing the end product to avoid naming 
 * collisions. Each library instance may operate upon separate window and 
 * document objects.
 * 
 * The ECMAScript package contains minimal code, just enough to provide:
 *
 * 1. A method for creating and extending namespaces with your own packages:
 *
 *  L<ECMAScript.Extend>('namespace', package);
 *
 * 2. A way to create new library instances which act upon target windows and 
 * their documents:
 *
 *  var js = new L<ECMAScript.Class>(window, document);
 *
 * ECMAScript does not implement any namespaces itself and can be used to build
 * a library from the ground up.
 *
 */

var ECMAScript = {

  Name: "{#name || 'An ECMAScript Library'}",

  Version: {#version || 0},

  Copyright: "{#copyright || 'No copyright provided'}",

  /**
   * @function About
   *
   * About message is a semi-colon delimited string of informational fields,
   * which take the form:
   *
   *  <name>;<version>;<packages>
   *
   * Where:
   *
   *  <name>        Common name for this library
   *  <version>     Numeric version to three decimal places
   *  <packages>    Comma-delimited string of package namespaces
   *
   * Example output:
   *
   *  ECMAScript;0.004;lang,util,crypt,console,data,http,dom
   */

  About: function () {
    var names = {};
    for (var i = 0; i < ECMAScript.Packages.length; i++) {
      var def = ECMAScript.Packages[i];
      var ns = def.namespace;
      var idx = ns.indexOf('.');
      var name = idx > 0 ? ns.substr(0, idx) : ns;
      names[name] = true;
    }
    var pkgs = [];
    for (var ns in names) {
      pkgs.push(ns);
    }
    return [this.Name, this.Version, pkgs.sort().join(',')].join(';');
  },

  /**
   * Packages
   * Internal registry of packages.
   */

  Packages: [],

  /**
   * Instances <ECMAScript.Class>
   * Internal array of ECMAScript.Class instances.
   *
   * Instance references are collected here so that they may be updated when
   * the library is extended after their creation.
   *
   * For instance:
   *
   *  var js = new ECMAScript.Class(window, document);
   *  
   *  ECMAScript.Extend('util', function (ecma) {
   *    ...
   *  });
   *
   *  // js is automatically extended
   *
   */

  Instances: [],

  /**
   * @function Extend
   * Extend (or define) a top-level ECMAScript namespace, i.e., extend the
   * library by either adding to or creating a package.  Extensions will be
   * applied to all running instance, allowing one load additional packages
   * on demand.
   *
   *  @param namespace    <String>    e.g., 'util', 'com', 'org.gnu'
   *  @param constructor  <Function>  See "Package Constructor Function" below
   *
   =  ECMAScript.Extend('util', function (ecma) {         // namespace 'util'
   =   
   =    this.say = function (message) {                   // public function
   =      alert(message);
   =    }
   =
   =  });
   *
   * The code above specifies the namespace 'util' which is extended (or 
   * defined if it has not been). This function is now available as:
   *
   *  js.util.say('Hello World');
   *
   # Package Constructor Function
   * 
   * The package constructor function is passed a reference to the library 
   * instance L<ECMAScript.Class> which is creating it.
   *
   * Rather than using function prototypes, the package constructor function
   * defines its methods in the function body.  This creates closures which
   * brings the current ECMAScript library instance (arguments[0]) in to scope
   * and also allows the package to have private member variables.
   *
   *  ECMAScript.Extend('util', function (ecma) {
   * 
   *    var _err = "Message is undefined";                // private var
   *
   *    this.say = function (message) {
   *      if (!message) {
   =        ecma.console.log(_err);                       // ecma is used
   *      } else {
   *        alert(message);
   *      }
   *    };
   *
   *  });
   * 
   * This constructor pattern is necessary for scoping, i.e., allowing access to the
   * current ECMAScript library instance.  Creating these closures does not 
   * create a critical memory hole because these are singleton packages in
   * respect to the number of running documents.
   */

  Extend: function (ns, func) {

    /* avoid confusion */
    ns = ns.toLowerCase();

    /* fail when choosing a clobbering namespace */
    for (var n in ECMAScript.Class.prototype) {
      if (ns == n) throw new Error('illegal name-space name: ' + ns);
    }

    /* extend the package definition */
    var def = {
      'namespace': ns,
      'constructor': func
    };
    ECMAScript.Packages.push(def);

    /* extend any existing instances */
    for (var i = 0; i < ECMAScript.Instances.length; i++) {
      ECMAScript.Instances[i].extend(ns, func);
    }

  },

  /**
   * @class ECMAScript.Class
   * Construct a new library instance.
   *
   *  @param window   <HTMLWindowElement>   Only requried/used with HTML-DOM JavaScript
   *  @param document <HTMLDocumentElement> Only requried/used with HTML-DOM JavaScript
   *
   *  var js = new ECMAScript.Class(window, document);
   */

  Class: function (win, doc) {

    /* scope global variables */
    this.window = win;
    this.document = doc;
    this.id = 'ecma' + Math.floor(Math.random()*100000);

    /* create each new package with the current scope */
    for (var i = 0; i < ECMAScript.Packages.length; i++) {
      var def = ECMAScript.Packages[i];
      this.extend(def.namespace, def.constructor);
    }

    /* allow subsequent library extentions to update this runtime */
    ECMAScript.Instances.push(this);

  }

};

/**
 * Library instance
 */

ECMAScript.Class.prototype = {

  /**
   * Target window object.
   */

  window: null,

  /**
   * Target document object
   */

  document: null,

  /**
   * @function extend
   * Either create or extend this instance with the given package constructor.
   *
   *  this.extend(ns, func);
   *
   *  ns    namespace
   *  func  package constructor function
   */

  extend: function (ns, func) {
    var nses = ns.split('.');
    var name = nses.pop();
    var inst = this;
    for (var i = 0, seg; seg = nses[i]; i++) {
      if (!inst[seg]) inst[seg] = {};
      inst = inst[seg];
    }
    if (inst[name]) {
      try {
      func.apply(inst[name], [this]);
      } catch (ex) {
        window.console.log("Cannot extend '" + name + "': " + ex);
      }
    } else {
      inst[name] = new func(this);
    }
  }

};
