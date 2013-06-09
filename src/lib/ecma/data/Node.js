/** @namespace data */
ECMAScript.Extend('data', function (ecma) {

  /**
   * @class Node
   * A data structure and wrapper with an interface akin to the HTML and XML DOM.
   *
   *  var node = new ecma.data.Node();
   *  var node = new ecma.data.Node(data); // data may be any value type
   *
   * This class implements node insertion and removal, maintaining the child 
   * and sibling member references.
   *
   *  var list = ecma.data.createNode();
   *  list.appendChild('Alpha');
   *  list.appendChild(3.14);
   *  list.appendChild(false);
   *  var node = list.firstChild;
   *  while (node) {
   *    ecma.console.log(node.index, node.data);
   *    node = node.nextSibling;
   *  }
   *
   * The above example will write the following output to the console:
   *
   *  0 Alpha
   *  1 3.14
   *  2 false
   *
   * When child nodes are inserted they are first checked to see if they are
   * already derived from L<ecma.data.Node>.  If not, they are considered
   * data and passed to L<ecma.data.Node.createNode> for construction.
   *
   * Nodes which are appended or inserted will be removed from their
   * originating containers.  For example:
   *
   *  var l1 = ecma.data.Node();
   *  var a = l1.appendChild('a');
   *  var l2 = ecma.data.Node();
   *  l2.appendChild(a);              // a will be removed from l1
   *
   * @member data
   * Gets/sets the data associated with this node.
   *
   * @member childNodes
   * All child nodes of this node.
   *
   * @member rootNode
   * The root node of this hierarchy.
   *
   * @member parentNode
   * The parent node of this node or C<null> if this is a not a child of 
   * another node.
   *
   * @member previousSibling
   * The node immediately preceding this node in the tree, or C<null> if this
   * is the first child.
   *
   * @member nextSibling
   * The node immediately following this node in the tree, or C<null> if this
   * is the last child.
   *
   * @member firstChild
   * The first direct child node of this node or C<null> if there are no child
   * nodes.
   *
   * @member lastChild
   * The last direct child node of this node or C<null> if there are no child
   * nodes.
   *
   * @member index
   * The index of this node in the tree or C<null> if this is a not a child of 
   * another node.
   *
   */

  var CNode = this.Node = function (data) {
    ecma.action.ActionDispatcher.apply(this);
    this.id = this.generateId();
    this.data = data;
    this.layerDefinitions = {};
    this.layers = {};
    this.childNodes = [];
    this.rootNode = this;
    this.parentNode = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this.index = null;
  };

  var _proto = this.Node.prototype = ecma.lang.createPrototype(
    ecma.action.ActionDispatcher
  );

  /**
   * Private Class Functions
   * These are designed be executed via C<call> or C<apply> with the scope of
   * a C<ecma.data.Node> instance.
   */

  function _crossCheck (node) {
    if (!ecma.util.isa(node, CNode)) {
      throw new Error('child is not a data node');
    }
    if (node.parentNode !== this) {
      throw new Error('child belongs to another parent');
    }
  }

  function _setChildMembers () {
    this.firstChild = this.childNodes[0];
    this.lastChild = this.childNodes[this.childNodes.length - 1];
  }

  function _instantiateLayer (name) {
    var layer = this.layers[name];
    if (!layer) {
      var klass = this.layerDefinitions[name];
      if (typeof(klass) == 'function') {
        layer = this.layers[name] = new klass(this, name);
      } else if (ecma.util.isObject(klass)) {
        layer = this.layers[name] = klass.createLayer(this, name);
      } else {
        throw new Error('Cannot instantiate layer: ' + name);
      }
    }
    return layer;
  }

  /**
   * Both prev/next members must be set for the prev, current, and next nodes.
   * Take for example a node which is moved as such:
   *
   *  -a- -b- -c- -d-
   *        __-^
   *       v
   *  -a- -c- -b- -d-
   *
   *    ^ ^ ^ ^ ^ ^   (need to be updated)
   *
   */
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

  function _unlink (node, bSilent) {
    return node.parentNode ? node.parentNode.removeChild(node, bSilent) : node;
  }

  function _vivify (node) {
    return ecma.util.isa(node, CNode)
      ? node
      : this.createNode.apply(this, arguments);
  }

  function _vivifyLayers () {
    this.layerDefinitions = ecma.util.clone(this.parentNode.layerDefinitions);
    for (var name in this.layerDefinitions) {
      _instantiateLayer.call(this, name);
    }
    return this.layers;
  }

  /** 
   * Event's are triggered on the container (parent) node, then the child.
   *
   * For example, if this is executed:
   *
   *    parentNode.removeChild(childNode);
   *
   * Then the following is triggered:
   *
   *    parentNode.onOrphan(childNode);   // First the parent
   *    childNode.onOrphaned();           // Then the child
   *
   * Notice that the action name (or class method) invoked on the child uses
   * the past participle. (As nodes are made to be nested.) In hindsight, it
   * would have been better to have named `onOrphan` as `onOrphanChild`.
   */

  function _trigger (actionName, node) {
    this.executeClassAction(actionName, node);
    _layerTrigger.call(this, actionName, node);
    node.executeClassAction(actionName + 'ed');
    _layerChildTrigger.call(node, actionName + 'ed');
  }

  function _nodeOnlyTrigger (actionName, node) {
    this.executeClassAction(actionName, node);
    node.executeClassAction(actionName + 'ed');
  }

  function _layerOnlyTrigger (actionName, node) {
    _layerTrigger.call(this, actionName, node);
    _layerChildTrigger.call(node, actionName + 'ed');
  }

  function _layerTrigger (actionName, node) {
    for (var name in this.layers) {
      var parentLayer = this.layers[name];
      if (parentLayer) {
        var childLayer = node.getLayer(name);
        if (childLayer) {
          parentLayer.executeClassAction(actionName, childLayer);
        }
      }
    }
  }

  function _layerChildTrigger (actionName) {
    for (var name in this.layers) {
      var layer = this.getLayer(name);
      if (layer) {
        layer.executeClassAction(actionName);
      }
    }
  }

  function _actionTrigger (actionName) {
    this.executeClassAction(actionName);
    for (var name in this.layers) {
      var layer = this.layers[name];
      if (layer) {
        layer.executeClassAction(actionName);
      }
    }
  }

  /**
   * Public Class Functions
   */

  /**
   * @function addLayer
   *
   *  addLayer(name, constructor);
   *  addLayer(name, object);
   *
   * @param name <String> A name unique to this node hierarchy for the layer
   * @param constructor <Function> The layer constructor function
   * @param object <Object> An object with a `createLayer` function
   *
   * Otherwise, its `createLayer` function is called immediately for this
   * [top-level] node to which it is being added.
   */

  _proto.addLayer = function (name, klass) {
    if (this.layerDefinitions[name]) {
      throw new Error('Layer named "' + name + '" exists');
    }
    this.layerDefinitions[name] = klass;
    var newLayer = _instantiateLayer.call(this, name);
    var childNode = this.firstChild;
    while (childNode) {
      var childLayer = childNode.addLayer(name, klass);
      if (childLayer) {
        if (newLayer) {
          newLayer.executeClassAction('onAdopt', childLayer);
        }
        childLayer.executeClassAction('onAdopted');
      }
      childNode = childNode.nextSibling;
    }
    return newLayer;
  };

  /**
   * @function removeLayer
   */

  _proto.removeLayer = function (name) {
    var layer = this.layers[name];
    delete this.layers[name];
    var childNode = this.firstChild;
    while (childNode) {
      var childLayer = childNode.removeLayer(name);
      if (childLayer) {
        layer.executeClassAction('onRemove', childLayer);
        childLayer.executeClassAction('onRemoved');
      }
      childNode = childNode.nextSibling;
    }
    delete this.layerDefinitions[name];
    return layer;
  };

  /**
   * @function getLayer
   */

  _proto.getLayer = function (name) {
    return this.layers[name];
  };

  _proto.getDataNode = function () {
    return this.data && js.util.isFunction(this.data.getDataNode)
      ? this.data.getDataNode()
      : this.data;
  };

  /**
   * @function getParentLayer
   */

  _proto.getParentLayer = function (name) {
    var layer = null;
    while (node.parentNode && !layer) {
      node = node.parentNode;
      layer = node.getLayer(name);
    }
    return layer;
  };

  /**
   * @function generateId
   * Create an identifier unique to each instance
   * Used internally however available for override.
   */

  _proto.generateId = function () {
    return js.util.randomId('n', 100000);
  };

  /**
   * @function createNode
   * Creates a new node for placement as a child of this node.
   *  var newNode = node.createNode();
   *  var newNode = node.createNode(data);
   */

  _proto.createNode = function (data) {
    return new CNode(data);
  };

  /**
   * @function appendChild
   * Adds a node to the end of the list of children of a specified parent 
   * node.
   *  var appendedNode = node.appendChild(data);
   *  var appendedNode = node.appendChild(newNode);
   * If the new node already exists it is removed from its parent node, then 
   * added to the specified parent node.
   */

  _proto.appendChild = function (node) {
    node = _vivify.apply(this, arguments);
    var isChild = node.parentNode === this;
    _unlink.call(this, node, isChild);
    node.previousSibling = this.lastChild;
    node.nextSibling = null;
    if (this.lastChild) this.lastChild.nextSibling = node;
    this.childNodes.push(node);
    node.index = this.childNodes.length - 1;
    node.parentNode = this;
    node.rootNode = this.rootNode || this;
    _setChildMembers.call(this);
    if (!isChild) _nodeOnlyTrigger.call(this, 'onAdopt', node);
    _vivifyLayers.call(node);
    if (!isChild) _layerOnlyTrigger.call(this, 'onAdopt', node);
    return node;
  };

  /**
   * @function appendChildren
   * Appends multiple child nodes to this node.
   *  var appendedNodes = node.appendChildren([data1, data2, ...]);
   * See also L<appendChild>
   */

  _proto.appendChildren = function (nodes) {
    if (!nodes || !ecma.util.isArray(nodes)) {
      return undefined;
    }
    var result = [];
    for (var i = 0; i < nodes.length; i++) {
      result.push(this.appendChild(nodes[i]));
    }
    return result;
  };

  /**
   * @function sortCompare
   */

  _proto.sortCompare = function (a, b) {
    return a && b
      ? a.toString().localeCompare(b.toString())
      : a ? -1 : b ? 1 : 0;
  };

  /**
   * @function sort
   */

  _proto.sort = function () {
    var sorted = [].concat(this.childNodes).sort(this.sortCompare);
    var hasChanged = false;
    for (var i = 0; i < sorted.length; i++) {
      var child = sorted[i];
      if (this.childNodes[i] !== child) {
        hasChanged = true;
        this.insertBefore(child, this.childNodes[i]);
        _actionTrigger.call(child, 'onReordered');
//      _trigger.call(this, 'onReorder', child);
      }
    }
    if (hasChanged) _actionTrigger.call(this, 'onReorder');
  };

  /**
   * @function insertChild
   * Insert a child according to this node's sort order.
   */

  _proto.insertChild = function (node) {
    node = _vivify.apply(this, arguments);
    var child = this.firstChild;
    var prev, next;
    while (child) {
      var delta = this.sortCompare(node, child);
      if (delta < 0) {
        next = child;
        break;
      } else if (delta == 0) {
        next = child;
        break;
      } else {
        prev = child;
      }
      child = child.nextSibling;
    }
    return next
      ? this.insertBefore(node, next)
      : prev
        ? this.insertAfter(node, prev)
        : this.appendChild(node);
  };

  /**
   * @function insertChildren
   * Insert multiple child nodes to this node.
   *  var insertedNodes = node.insertChildren([data1, data2, ...]);
   * See also L<insertChild>
   */

  _proto.insertChildren = function (nodes) {
    if (!nodes || !ecma.util.isArray(nodes)) {
      return undefined;
    }
    var result = [];
    for (var i = 0; i < nodes.length; i++) {
      result.push(this.insertChild(nodes[i]));
    }
    return result;
  };

  /**
   * @function insertBefore
   * Inserts the specified node before a reference node as a child of the 
   * current node. 
   *  var insertedNode = parentNode.insertBefore(data, referenceNode)
   *  var insertedNode = parentNode.insertBefore(newNode, referenceNode)
   * If the newNode already exists it is removed from its parent node, then 
   * inserted into the specified parent node.
   */

  _proto.insertBefore = function (node, child, args) {
    _crossCheck.call(this, child);
    if (args) {
      args.unshift(node)
    } else {
      args = [node];
    }
    node = _vivify.apply(this, args);
    var isChild = node.parentNode === this;
    _unlink.call(this, node, isChild);
    var index = child.index;
    this.childNodes.splice(index, 0, node);
    result = node;
    for (var i = index; i < this.childNodes.length; i++) {
      this.childNodes[i].index = i;
    }
    _relink.call(this, index);
    node.parentNode = this;
    node.rootNode = this.rootNode || this;
    _setChildMembers.call(this);
    if (!isChild) _nodeOnlyTrigger.call(this, 'onAdopt', node);
    _vivifyLayers.call(node);
    if (!isChild) _layerOnlyTrigger.call(this, 'onAdopt', node);
    return node;
  };

  /**
   * @function insertAfter
   * Inserts the specified node after a reference node as a child of the
   * current node.
   *  var insertedNode = parentNode.insertAfter(data, referenceNode)
   *  var insertedNode = parentNode.insertAfter(newNode, referenceNode)
   * If the newNode already exists it is removed from its parent node, then 
   * inserted into the specified parent node.
   */

  _proto.insertAfter = function (node, child) {
    _crossCheck.call(this, child);
    return child.nextSibling
      ? this.insertBefore(node, child.nextSibling)
      : this.appendChild(node);
  };

  /**
   * @function removeChild
   * Removes a child node.
   *  removedNode = parentNode.removeChild(childNode);
   */

  _proto.removeChild = function (node, bSilent) {
    _crossCheck.call(this, node);
    var result = null;
    var index = 0;
    for (; index < this.childNodes.length; index++) {
      if (this.childNodes[index] === node) {
        result = node;
        this.childNodes.splice(index, 1);
        break;
      }
    }
    if (!result) {
      throw new Error('programatic error, known child not found');
    }
    for (var i = index; i < this.childNodes.length; i++) {
      this.childNodes[i].index--;
    }
    _relink.call(this, index);
    _setChildMembers.call(this);
    result.previousSibling = null;
    result.nextSibling = null;
    result.parentNode = null;
    result.rootNode = null;
    // Preserve result.index
    if (!bSilent) _trigger.call(this, 'onOrphan', result);
//
//  When silent, still need to unlink layers...
//
//  _instantiateLayers would then relink (on existing layers)
//
//  Right now the relinking all happens in Layer.onReorder
//
    return result;
  };

  /**
   * @function removeAllChildren
   * Remove all child nodes.
   *  parentNode = parentNode.removeAllChildren();
   */

  _proto.removeAllChildren = function () {
    for (var i = 0; i < this.childNodes.length; i++) {
      var child = this.childNodes[i];
      child.previousSibling = null;
      child.nextSibling = null;
      child.parentNode = null;
      child.rootNode = null;
      // Preserve child.index
      _trigger.call(this, 'onOrphan', child);
    }
    this.childNodes = [];
    this.firstChild = null;
    this.lastChild = null;
    return this;
  };

  /**
   * @function replaceChild
   * Replaces one child node of the specified parent node with another.
   *  replacedNode = parentNode.replaceChild(data, childNode);
   *  replacedNode = parentNode.replaceChild(newNode, childNode);
   * If the newNode already exists it is removed from its parent node, then 
   * inserted into the specified parent node.
   */

  _proto.replaceChild = function (node, child, args) {
    _crossCheck.call(this, child);
    if (args) {
      args.unshift(node)
    } else {
      args = [node];
    }
    node = _vivify.apply(this, args);
    var isChild = node.parentNode === this;
    _unlink.call(this, node, isChild);
    node.previousSibling = child.previousSibling;
    node.nextSibling = child.nextSibling;
    node.index = child.index;
    var result = this.childNodes[child.index];
    this.childNodes[child.index] = node;
    node.parentNode = this;
    node.rootNode = this.rootNode || this;
    _setChildMembers.call(this);
    _unlink.call(this, child);
    if (!isChild) _nodeOnlyTrigger.call(this, 'onAdopt', node);
    _vivifyLayers.call(node);
    if (!isChild) _layerOnlyTrigger.call(this, 'onAdopt', node);
    return result;
  };

  /**
   * @function walk
   * Recursively iterate into each node applying the callback function.
   *
   *  node.walk(callback);
   *  node.walk(function);
   *  node.walk(function, scope);
   *  node.walk(function, scope, args);
   *
   * The callback function's first argument is always:
   *
   *  node        The current node
   *
   * and can return:
   *
   *  undefined   Keep walking
   *  'continue;' Move on to the next sibling (returns undefined)
   *  'break;'    Stop walking (returns undefined)
   *  !undefined  Stop walking (returns said value)
   */

  var _break = _proto.BREAK = {signal:'break;'};
  var _continue = _proto.CONTINUE = {signal:'continue;'};

  function _walk (cb) {
    var node = this.firstChild;
    var result = undefined;
    while (node) {
      result = ecma.lang.callback(cb, this, [node]);
      if (!result && node.hasChildNodes()) {
        result = _walk.call(node, cb);
      }
      if (result && result !== _continue) {
        break;
      }
      node = node.nextSibling;
    }
    return result;
  }

  _proto.walk = function (callback, scope, args) {
    var cb = ecma.lang.createCallback(arguments);
    var result = _walk.call(this, cb);
    return result && (result === _break || result === _continue)
      ? undefined
      : result;
  };

  /**
   * @function iterate
   *
   * Like L<walk> however not recursive.
   */

  _proto.iterate = function (callback, scope, args) {
    var cb = ecma.lang.createCallback(arguments);
    var node = this.firstChild;
    var result;
    while (node) {
      result = ecma.lang.callback(cb, this, [node]);
      if (result && result !== _continue) {
        break;
      }
      node = node.nextSibling;
    }
    return result && (result === _break || result === _continue)
      ? undefined
      : result;
  };

  /**
   * @class getNodeByData
   */

  _proto.getNodeByData = function (data) {
    return this.walk(function (n) {
      if (n.data === data) return n;
    });
  };

  /**
   * @function getDepth
   * Return the number of ancestors for this node.
   *  var depth = node.getDepth();
   */

  _proto.getDepth = function () {
    var node = this;
    var depth = 0;
    while (node = node.parentNode) {
      depth++;
    }
    return depth;
  };

  /**
   * @function hasChildNodes
   * Checks for the existence of child nodes.
   *  var bool = node.hasChildNodes();
   */

  _proto.hasChildNodes = function () {
    return this.childNodes.length > 0;
  };

  /**
   * @function toString
   */

  _proto.toString = function () {
    return this.id;
  };

});
