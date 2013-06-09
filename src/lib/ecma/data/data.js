/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  var _package = this;

  var _inspect = function (unk, name, ctrl, sep) {
    var result = '';
    if (!ecma.util.defined(sep)) sep = "\n";
    if (typeof(unk) == 'function') {
      unk = '(function)';
    } else if (ecma.util.isObject(unk)) {
      if (!ecma.util.grep(function (i) {return i === unk}, ctrl)) {
        ctrl.push(unk);
        var pName = ecma.util.defined(name) && name != '' ? name + '/' : '';
        for (var k in unk) {
          var v = unk[k];
          result += _inspect(v, pName + k, ctrl, sep);
        }
        return result;
      }
    }
    result += name + ':' + unk + sep;
    return result;
  };

  /**
   * @function inspect
   * Return a string representing each recursive value in an object
   *
   *  var str = ecma.data.inspect(val);
   */

  _package.inspect = function (unk, name, sep) {
    return _inspect(unk, name || '', [], sep);
  };

  /**
   * @function fromObject
   *
   */

  _package.fromObject = function (obj) {
    if (!js.util.isDefined(obj)) return obj;
    var result;
    if (js.util.isAssociative(obj)) {
      result = new ecma.data.HashList();
      for (var k in obj) {
        result.setValue(k, _package.fromObject(obj[k]));
      }
    } else if (js.util.isArray(obj)) {
      result = new ecma.data.Array();
      for (var i = 0; i < obj.length; i++) {
        result.setValue(i, _package.fromObject(obj[i]));
      }
    } else {
      // XXX Dates, Numbers, Etc are stringified (Not intentionally)
      // TODO Clone Dates, Numbers, and other predefined Objects
      result = obj.toString();
    }
    return result;
  };

});
