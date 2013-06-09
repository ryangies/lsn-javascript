/**
 * @global js
 * @function extend
 * @member window
 * @member document
 *
 * A global instance of the library running under the context of the current 
 * window and document:
 *
 *  var js = new L<ECMAScript.Class>(window, document);
 *
 * From the perspective of the code which B<uses> the library we refer to the
 * running instance as C<js>.  The name C<js> is not set in stone, it is simply
 * the default name with which the library is built.
 *
 *  js.console.log("Hello World");    // Normal usage
 *
 * From the perspective of the packages which make up the library, we refer
 * to the running instance as C<ecma>.  The name C<ecma> is not set in stone,
 * it is simply the default parameter name which we have standardized upon.
 *
 =  ecma.console.log("Hello World");  // Calling from inside a library package
 *
 */
js = new ECMAScript.Class(window, document);
