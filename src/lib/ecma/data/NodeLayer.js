/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  function _relink (index) {
    for (var i = index - 1; i <= index + 1; i++) {
      if (i < 0) continue;
      if (i >= this.childNodes.length) break;
      var prevNode = i < 1 ? null : this.childNodes[i - 1];
      var currNode = i < this.childNodes.length ? this.childNodes[i] : null;
      var nextNode = i <= this.childNodes.length ? this.childNodes[i + 1] : null;
      if (prevNode) prevNode.nextSibling = currNode;
      if (currNode) currNode.previousSibling = prevNode;
      if (currNode) currNode.nextSibling = nextNode;
      if (nextNode) nextNode.previousSibling = currNode;
    }
  }

  function _setChildMembers () {
    this.firstChild = this.childNodes[0];
    this.lastChild = this.childNodes[this.childNodes.length - 1];
    var child = this.firstChild;
    for (var i = 0; i < this.childNodes.length; i++) {
      this.childNodes[i].index = i;
    }
  }

  var CActionDispatcher = ecma.action.ActionDispatcher;

  /**
   * @class CNodeLayer
   */

  var CNodeLayer = this.NodeLayer = function (node, name) {
    CActionDispatcher.apply(this);
    this.node = node;
    this.layerName = name;
    this.childNodes = [];
    this.rootNode = this;
    this.parentNode = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this.index = null;
    ecma.lang.assert(ecma.util.isDefined(this.layerName),
        'Node layers MUST be named.');
    if (node.parentNode) {
      // Due to filtering, the index of the layer may differ from the index of 
      // its node. See ecma.data.Node's layer instantiation, where the layer
      // is an instance with a createLayer method (which may return null).
      var parentLayer = node.parentNode.getLayer(this.layerName);
      if (parentLayer) {
        var numChildren = parentLayer.childNodes.length;
        var index = numChildren > 0
          ? Math.min(numChildren, node.index)
          : 0;
        parentLayer.childNodes.splice(index, 0, this);
        this.index = index;
        this.parentNode = parentLayer;
        this.rootNode = parentLayer.rootNode;
        _relink.call(parentLayer, index);
        _setChildMembers.call(parentLayer);
      }
    }
  };

  var _proto = this.NodeLayer.prototype = ecma.lang.createPrototype(
    CActionDispatcher
  );

  /**
   * @function onAdopt
   */

  _proto.onAdopt = function (layer) {
    // Handled in constructor because a derived class' constructor wants this 
    // layer to be hooked up.
  };

  _proto.onAdopted = function () {
  };

  /**
   * @function onOrphan
   */

  _proto.onOrphan = function (layer) {
    var index = layer.index;
    this.childNodes.splice(index, 1);
    layer.parentNode = null;
    layer.rootNode = null;
    _relink.call(this, index);
    _setChildMembers.call(this);
  };

  /**
   * @function onOrphaned
   */

  _proto.onOrphaned = function () {
  };

  /**
   * @function onReordered
   */

  _proto.onReordered = function () {
    var oldIndex = this.index;
    var newIndex = 0;
    var parentLayer
    try {
      var node = this.node.parentNode.firstChild;
      while (node && node !== this.node) {
        if (node.getLayer(this.layerName)) newIndex++;
        node = node.nextSibling;
      }
    } catch (ex) {
    }
    if (newIndex == oldIndex) return;
    this.parentNode.childNodes.splice(oldIndex, 1);
    this.parentNode.childNodes.splice(newIndex, 0, this);
    this.index = newIndex;
    _relink.call(this.parentNode, oldIndex);
    _relink.call(this.parentNode, newIndex);
    _setChildMembers.call(this.parentNode);
  };

  /**
   * @function onReorder
   */

  _proto.onReorder = function () {
  };

  /**
   * @function walk
   * Recursively iterate into each node applying the callback function.
   *
   *  node.walk(function);
   *  node.walk(function, scope);
   *
   * The callback function is passed one parameter
   *
   *  node    The current node
   */

  _proto.walk = function (callback, scope) {
    function nodeCallback (node) {
      var layer = node.getLayer(this.layerName);
      if (layer) {
        callback.call(scope || this, layer);
      }
    }
    this.node.walk(nodeCallback, this);
  };

  _proto.getDataNode = function () {
    return this.node ? this.node.getDataNode() : null;
  };

  /**
   * @function hasChildNodes
   * Checks for the existence of child nodes.
   *  var bool = node.hasChildNodes();
   */

  _proto.hasChildNodes = function () {
    return this.childNodes.length > 0;
  };

});
