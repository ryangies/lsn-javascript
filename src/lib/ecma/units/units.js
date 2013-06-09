/**
 * @namespace units
 * Common functions for converting and formatting units.
 */

ECMAScript.Extend('units', function (ecma) {

  this.ONE_KiB = Math.pow(2, 10); // kibi
  this.ONE_MiB = Math.pow(2, 20); // mebi
  this.ONE_GiB = Math.pow(2, 30); // gibi
  this.ONE_TiB = Math.pow(2, 40); // tebi
  this.ONE_PiB = Math.pow(2, 50); // pebi
  this.ONE_EiB = Math.pow(2, 60); // exbi
  this.ONE_ZiB = Math.pow(2, 70); // zebi
  this.ONE_YiB = Math.pow(2, 80); // yobi

  var _units = [
    [this.ONE_KiB, 'K'],
    [this.ONE_MiB, 'M'],
    [this.ONE_GiB, 'G'],
    [this.ONE_TiB, 'T'],
    [this.ONE_PiB, 'P'],
    [this.ONE_EiB, 'E'],
    [this.ONE_ZiB, 'Z'],
    [this.ONE_YiB, 'Y']
  ];

  /**
   * @function bytesize
   *
   * Return a human-readable size given a number of bytes.
   *
   *  sz = ecma.units.bytesize(bytes);
   *  sz = ecma.units.bytesize(bytes, digits);
   *  sz = ecma.units.bytesize(bytes, digits, min);
   *
   * Where:
   *
   *  bytes   <Number>      The number of bytes to represent
   *  digits  <Number>      Significant digits (default=2)
   *  min     <Number>      Minimum representation size (default=ONE_KiB)
   */

  this.bytesize = function (bytes, digits, min) {
    bytes = ecma.util.asInt(bytes);
    var denominator = 1;
    var sym = 'B';
    var unit;
    for (var i = 0; unit = _units[i]; i++) {
      if ((!min || unit[0] >= min) && bytes < unit[0]) break;
      denominator = unit[0];
      sym = unit[1];
    }
    var num = bytes / denominator;
    return(num.toFixed(digits) + sym);
  }

});
