/** @namespace data */

ECMAScript.Extend('data', function (ecma) {

  var _proto = {};

  var _symbolToClassMap = {
    /*
    '?': ecma.window.Boolean,
    '#': ecma.window.Number,
    '~': ecma.window.Date,
    */
    '%': ecma.data.HashList,
    '@': ecma.data.Array,
    '$': ecma.window.String
  };

  var _typeToSymbolMap = {
    /*
    'boolean':  '?',
    'number':   '#' ,
    */
    'string':   '$'
  };

  /**
   * @class XFR
   */

  this.XFR = function (encoding) {
    this.encoding = encoding;
  };

  this.XFR.prototype = _proto;

  /**
   * @function symbolToClass
   * Get the class constructor for the provided symbol.
   */

  _proto.symbolToClass = function (symbol) {
    var klass = _symbolToClassMap[symbol];
    return klass;
  };

  /**
   * @function classToSymbol
   */

  _proto.classToSymbol = function (obj) {
    var type = typeof(obj);
    var symbol = _typeToSymbolMap[type];
    if (symbol) return symbol;
    for (symbol in _symbolToClassMap) {
      if (obj instanceof _symbolToClassMap[symbol]) return symbol;
    }
  };

  /**
   * @function createObject
   * Create an object for the provided symbol.
   */

  _proto.createObject = function (symbol) {
    var klass = this.symbolToClass(symbol);
    return new klass();
  };

  /**
   * @function createValue
   * Create an object for the provided symbol.
   */

  _proto.createValue = function (symbol, value) {
    // TODO encode booleans with their "?" symbol
    if (value == 'true') return true;
    if (value == 'false') return false;
    var klass = this.symbolToClass(symbol);
    if (klass === String) return value;
    return new klass(value);
  };

  /**
   * @function encodeComponent
   * Encode a component (key or value)
   */

  _proto.encodeComponent = function (str) {
    return this.encoding == 'base64'
      ? ecma.data.base64.encode(str)
      : ecma.window.encodeURIComponent(str);
  };

  /**
   * @function decodeComponent
   * Decode a component (key or value)
   */

  _proto.decodeComponent = function (str) {
    return this.encoding == 'base64'
      ? ecma.data.base64.decode(str)
      : ecma.window.decodeURIComponent(str);
  };

  /**
   * @function parse
   * Create an object from a transfer-encoded string.
   */

  _proto.parse = function (str) {
    if (!ecma.util.defined(str)) return;
    var CHash = this.symbolToClass('%');
    var CArray = this.symbolToClass('@');
    var CScalar = this.symbolToClass('$');
    var m =  str.match(/^([\%\$\@]){/);
    if (!m) throw new Error('str must begin with "%{", "@{", or "${"');
    if (m[1] == '$') {
      var value = str.substr(2, (str.length - 3));
      return this.decodeComponent(value);
    }
    var root = this.createObject(m[1], null);
    var pos = 2;
    var node = root;
    var nodeParent = root;
    var parents = [];
    while (true) {
      var open_pos = str.indexOf('{', pos);
      var close_pos = str.indexOf('}', pos);
      if (close_pos < open_pos && close_pos >= 0) {
        node = parents.pop() || root;
        pos = close_pos + 1;
        continue;
      }
      if (open_pos < 0) break;
      var key = str.substr(pos, (open_pos - pos));
      var len = key.length - 1;
      var type = key.substr(len, 1);
      key = key.substr(0, len);
      key = this.decodeComponent(key);
      pos = open_pos + 1;
      if (type == '%' || type == '@') {
        parents.push(node);
        nodeParent = node;
        node = this.createObject(type, nodeParent);
        if (ecma.util.isa(nodeParent, CHash)) {
          nodeParent.setValue(key, node);
        } else if (ecma.util.isa(nodeParent, CArray)) {
          nodeParent.push(node);
        }
      } else {
        if (!this.symbolToClass(type)) throw new Error('invalid data type: ' + type);
        open_pos = str.indexOf('{', pos);
        if (open_pos >= 0 && open_pos < close_pos) close_pos = open_pos - 1;
        var vstr = str.substr(pos, (close_pos - pos));
        vstr = this.decodeComponent(vstr);
        var value = this.createValue(type, vstr);
        if (ecma.util.isa(node, CHash)) {
          node.setValue(key, value);
        } else if (ecma.util.isa(node, CArray)) {
          node.push(value);
        } else if (node && node.setValue instanceof Function) {
          node.setValue(value);
        } else {
          nodeParent += value;
        }
        pos = close_pos + 1;
      }
    }
    return root;
  };

  /**
   * @function format
   * Create a transfer-encoded string representing the object structure.
   */

  _proto.format = function (obj) {
    var result = '';
    var symbol = this.classToSymbol('');
    if (!ecma.util.defined(obj)) return symbol + '{}';
    if (obj.toXFR) {
      return obj.toXFR();
    } else if (ecma.util.isArray(obj)) {
      var result = '@{';
      for (var i = 0; i < obj.length; i++) {
        result += this.format(obj[i]);
      }
      return result + '}';
    } else if (ecma.util.isAssociative(obj)) {
      var result = null;
      if (typeof(obj.toUTCString) == 'function') {
        result = '${' + this.encodeComponent(obj.toUTCString()) + '}';
      } else {
        result = '%{';
        for (var k in obj) {
          var v = obj[k];
          result += this.encodeComponent(k) + this.format(v);
        }
        result += '}';
      }
      return result;
    } else {
      return '${' + this.encodeComponent(obj) + '}';
    }
  };

});

/** @namespace data */

ECMAScript.Extend('data', function (ecma) {

  /**
   * @instance xfr <ecma.data.XFR>
   * Static access to L<ecma.data.XFR> class methods.
   */

  this.xfr = new ecma.data.XFR('base64');

});
