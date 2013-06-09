/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CNode = ecma.hubb.Node;
  var CActionDispatcher = ecma.action.ActionDispatcher;

  /**
   * @class ScalarNode
   */

  this.ScalarNode = function (value) {
    CNode.call(this);
    this.value = value;
  };

  var ScalarNode = ecma.lang.createPrototype(CNode);

  this.ScalarNode.prototype = ScalarNode;

  /**
   * @function dispatchAction
   */

  ScalarNode.dispatchAction = function () {
    var invoker = CActionDispatcher.prototype.dispatchAction;
    this.invokeAction(invoker, true, arguments); // bubbles
  };

  proto.renameValue = function (oldKey, newKey, index) {
    throw new Error('Scalar nodes do not contain children');
  };

  ScalarNode.setValue = function (value) {
    return this.value = value;
  };

  ScalarNode.getValue = function () {
    if (ecma.util.defined(arguments[0])) return; // getValueOf
    return this.value;
  };

  ScalarNode.toString = function () {
    if (ecma.util.defined(arguments[0])) return; // getValueOf
    return this.getValue();
  };

  ScalarNode.toObject = function () {
    if (ecma.util.defined(arguments[0])) return; // getValueOf
    return this.getValue();
  };

  ScalarNode.toXFR = function () {
    return '${' + ecma.data.xfr.encodeComponent(this.getValue()) + '}';
  };

  ScalarNode.getContent = function () {
    return this.getValue();
  };

  ScalarNode.merge = function (scalar) {
    var sv = scalar.getValue();
    if (this.value != sv) {
      this.value = sv;
      this.dispatchAction('change', this);
    };
    return CNode.prototype.merge.apply(this, arguments);
  };

  ScalarNode.tie = function (elem, attrs, styles) {
    function onChange (action, sv) {
      var value = sv.getValue();
      if (attrs) {
        for (var i = 0, attr; attr = attrs[i]; i++) {
          ecma.dom.setAttribute(elem, attr, value);
        }
      }
      if (styles) {
        for (var i = 0, style; style = styles[i]; i++) {
          ecma.dom.setStyle(elem, style, value);
        }
      }
    }
    onChange(null, this);
    return this.addActionListener('onChange', onChange);
  };

});
