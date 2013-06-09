/**
 * @namespace thread
 * Threading model.
 *
 # This creates an unwanted dependency on L<ecma.dom.setTimeout> because the
 # we need to surpress the number-of-seconds-late argument from being inserted
 # into the argument stack.
 *
 * Maybe not the best idea in the world, however the intention is to give the
 * programmer the function of creating and managing threads.
 *
 * Currently this uses the C<setTimeout> function of the window object.  This
 * is obviously a browser-based solution.  However, the understanding is that
 * the window object is the browser's "platform" and that any "platform" will
 * implement a C<setTimeout> function.
 *
 * TODO Determine if there is a better way to achieve this goal, if the
 * C<setTimeout> presumption is valid, and research what it would take to 
 * incorporate suport for other platforms.
 */

ECMAScript.Extend('thread', function (ecma) {

  /**
   * @function spawn
   * Spawn a new thread.
   *
   *  ecma.thread.spawn(func);
   *  ecma.thread.spawn(func, scope);
   *  ecma.thread.spawn(func, scope, args);
   *
   * @param func    <Function|Array> Callback function
   * @param scope   <Object> Default scope (optional)
   * @param args    <Array> Arguments (optional)
   * @param excb    <Function> Exception handler (optional)
   */

  this.spawn = function (func, scope, args, excb) {
    var cb = ecma.lang.createCallbackArray(func, scope, args);
    ecma.dom.setTimeout(cb[0], 0, cb[1], cb[2], excb);
  }

});
