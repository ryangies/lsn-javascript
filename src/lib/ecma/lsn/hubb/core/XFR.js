/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CXFR = ecma.data.XFR;

  var proto = ecma.lang.createPrototype(CXFR);

  /**
   * @class XFR
   */

  this.XFR = function (encoding) {
    CXFR.apply(this, arguments);
  };

  this.XFR.prototype = proto;

  /**
   * @function symbolToClass
   */

  proto.symbolToClass = function (symbol) {
    return symbol == '%' ? ecma.hubb.HashNode :
      symbol == '@' ? ecma.hubb.ArrayNode :
      symbol == '$' ? ecma.hubb.ScalarNode :
//    symbol == '#' ? ecma.hubb.NumberNode :
//    symbol == '~' ? ecma.hubb.DateNode :
//    symbol == '?' ? ecma.hubb.BooleanNode :
      null;
  };

  /**
   * @function createValue
   */

  proto.createValue = function (symbol, value) {
    var klass = this.symbolToClass(symbol);
    if (klass === String) return value;
    return new klass(value);
  };

});
