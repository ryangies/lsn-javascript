/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @function addr_split
   * Splits the given address into segments.
   *  var array = addr_split('/alpha/bravo');
   * The above example will return:
   *  ['alpha', 'bravo']
   */

  this.addr_split = function (addr) {
    if (ecma.util.isArray(addr)) return addr;
    if (!ecma.util.defined(addr) || addr === "" || addr == '/') return [];
    if (!ecma.util.isString(addr)) return [addr];
    return addr.replace(/^\//, '').split('/');
  };

  /**
   * @function addr_normalize
   * Normalize the given address.
   *  var string = addr_normalize('/alpha//bravo/');
   * The above example will return:
   *  /alpha/bravo
   */

  this.addr_normalize = function (addr) {
    if (!ecma.util.defined(addr) || addr === "") return '';
    if (typeof(addr) == 'string') {
      addr = addr.replace(/\/{2,}/g, '/');
      if (addr == '/') return addr;
      addr = addr.replace(/\/$/, '');
      // TODO replace '../foo' constructs
      return addr;
    }
  };

  /**
   * @function addr_ext
   * Get the extension portion of the address.
   *  var string = addr_ext('/alpha/bravo.charlie');
   * The above example will return:
   *  charlie
   */

  this.addr_ext = function (addr) {
    var lastKey = this.addr_split(addr).pop();
    if (!lastKey) return;
    if (typeof(lastKey) != 'string') return;
    if (lastKey.indexOf('.') <= 0) return;
    return lastKey.split('.').pop();
  };

  /**
   * @function addr_parent
   * Get the parent address of the address.
   *  var string = addr_parent('/alpha/bravo');
   * The above example will return:
   *  /alpha
   */

  this.addr_parent = function (addr) {
    var parts = this.addr_split(addr);
    parts.pop();
    var result = parts.length ? parts.join('/') : '';
    return addr.indexOf('/') == 0 ? '/' + result : result;
  };

  /**
   * @function addr_name
   * Get the name portion of the address.
   *  var string = addr_name('/alpha/bravo.charlie');
   * The above example will return:
   *  bravo.charlie
   */

  this.addr_name = function (addr) {
    var parts = this.addr_split(addr);
    return parts.pop();
  };

  /**
   * @function addr_join
   * Join the array elements to create an address.
   *  var string = addr_join(['alpha', 'bravo']);
   * The above example will return:
   *  alpha/bravo
   */

  this.addr_join = function () {
    var args = ecma.util.args(arguments);
    var addr = args.shift();
    if (!addr) throw new Error('Missing Argument: addr');
    var list = addr instanceof Array ? addr : [addr];
    list = list.concat(args);
    return ecma.data.addr_normalize(list.join('/').replace(/^\/\//, '/'));
  };

});
