/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  /**
   * @class Node
   *
   = Data Actions
   *
   * We invoke actions for data events with this callback signature:
   *
   *  function (action, dnode) {}
   *
   * Where the `action.name` and `dnode` is:
   *
   *  action.name     dnode
   *  --------------- -----------------------------------------------
   *  create          New node
   *  fetch           New node
   *  remove          Removed node
   *  update          Updated node
   *  status          Updated node
   *  change          Updated node
   *  store           Updated node
   *  replace         Updated node
   *  update          Updated node
   *
   * For the `update` action, additional information is passed in the action
   * event under `action.updated`:
   *
   *  Special
   *
   *  action.updated.key      newKey          The new key, e.g., a renamed node
   *  action.updated.index    newIndex        The new index (for ordered hashes)
   *  action.updated.order    true|false      The node's *children* have been reordered
   *
   *  Attributes
   *
   *  action.updated.content  newContent      The new text content
   *  action.updated.mtime    newMtime        The new last-modified time
   *  action.updated.*        newValue        Any other attribute which has been modified
   *  action.updated.*        newValue        Any other attribute which has been modified
   * 
   */

  this.Node = function () {
    CActionDispatcher.apply(this);
    this.iid = ecma.util.rand8(); // Instance ID (of this object)
    this.attributes = {};
  };

  var Node
      = this.Node.prototype
      = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @function getInstanceId - Object instance identifier
   */

  Node.getInstanceId = function () {
    return this.iid;
  };

  /**
   * @function getDataNode
   *
   * Because nodes are often wrapped within nodes, this method exposes this
   * underlying data node. Provided such that the wrapper class:
   *
   *  Wrapper.prototype.getDataNode = function () {
   *    return this.dnode.getDataNode();
   *  }
   *
   * And methods which operatate on data nodes can then be passed a real dnode
   * or a Wrapper instance.
   * 
   */

  Node.getDataNode = function () {
    return this;
  };

  // ActionDispatcher Interface

  Node.executeAction = function () {
    var invoker = CActionDispatcher.prototype.executeAction;
    this.invokeAction(invoker, false, arguments);
  };

  Node.dispatchAction = function () {
    var invoker = CActionDispatcher.prototype.dispatchAction;
    this.invokeAction(invoker, false, arguments);
  };

  Node.invokeAction = function (invoker, bBubble, args) {

    if (bBubble) {

      // Bubble
      var node = this;
      while (node && node.parentNode) {
        invoker.apply(node, args);
        node = node.parentNode;
      }

      // And also to the root's (DataBridge) listeners
      var root = node === this ? null : node;
      if (root && root.db) invoker.apply(root.db, args);

    } else {

      // Broadcast to listeners of this instance
      invoker.apply(this, args);

      // And also to the root's (DataBridge) listeners
      var root = this.getRoot();
      if (root && root.db) {
        invoker.apply(root.db, args);
      }

    }

  };

  // For vififying new values
 
  Node.createStubNode = function (key) {
    ecma.lang.assert(!this.getValue(key));
    var stub = new ecma.hubb.ScalarNode();
    stub.setAddress(this.getAddress() + '/' + key);
    stub.setAttribute('type', 'unknown');
    stub.setAttribute('mtime', '0');
    this.replaceValue(key, stub);
    return stub;
  };

  Node.toString = function () {
    return ''; // Only scalar values should return something
  };

  // API - Attributes

  Node.getTimestamp = function () {
    var storage = this.getStorage();
    return storage.getAttribute('mtime');
  };

  Node.hasFetched = function () {
    return this.isData() ? true : this.getTimestamp() ? true : false;
  };

  Node.getModifiedDate = function () {
    var storage = this.getStorage();
    if (!storage) return null;
    var mtime = storage.getAttribute('mtime');
    if (!mtime) return null;
    return new Date(1000 * mtime); // secs to millis
  };

  Node.getDate = function () {
    var storage = this.getStorage();
    if (!storage) return null;
    var mtime = storage.getAttribute('mtime') || storage.getAttribute('mtime2');
    if (!mtime) return null;
    return new Date(1000 * mtime); // secs to millis
  };

  Node.getStorage = function () {
    if (this.storage) return this.storage;
    var node = this;
    var storage = null;
    while (node && !storage) {
      var type = node.getAttribute('type');
      if (type && type.match(/^(directory|file-)/)) storage = node;
      node = node.parentNode;
    }
    return this.storage = storage;
  };

  Node.getContent = function () {
    return this.getAttribute('content');
  };

  Node.getAddress = function () {
    return this.getAttribute('addr');
  };

  Node.setAddress = function (addr) {
    return this.setAttribute('addr', addr);
  };

  Node.setParentAddress = function (paddr) {
    var key = this.getKey();
    var addr = ecma.data.addr_join(paddr, key);
    this.setAddress(addr);
  };

  Node.getType = function () {
    return this.getAttribute('type') || '';
  };

  Node.getIcon = function () {
    var iconPath = this.getAttribute('icon');
    if (!iconPath) {
     var type = this.getType();
     ecma.lang.assert(type);
     iconPath = ecma.hubb.getIconByType(type);
     this.setAttribute('icon', iconPath);
    }
    return iconPath;
  };

  Node.getFilesize = function () {
    var bytes = this.isFile() ? this.getAttribute('size') : undefined;
    if (ecma.util.defined(bytes)) {
      bytes = ecma.units.bytesize(bytes);
    } else {
      bytes = '';
    }
    return bytes;
  };

  // API - Types

  Node.isDirectory = function () {
    return this.getType().match(/^directory/) ? true : false;
  };

  Node.isFile = function () {
    return this.getType().match(/^file-/) ? true : false;
  };

  Node.isData = function () {
    return this.getType().match(/^data-/) ? true : false;
  };

  Node.isDataArray = function () {
    return this.getType().match(/^data-array/) ? true : false;
  };

  Node.isDataHash = function () {
    return this.getType().match(/^data-hash/) ? true : false;
  };

  Node.isDataContainer = function () {
    return this.getType().match(/^(data-(hash|array)|file-((binary-)?multipart|data))/)
      ? true : false;
  };

  Node.canExpand = function () {
    var type = this.getType();
    if (!type) return false;
    return type == 'directory'
      || type.match(/^file-(data|multipart)/)
      || type.match(/^data-(array|hash)/)
      ? true : false;
  };

  // System

  Node.getKey = function () {
    // When an update from the server is merged, our attributes are cleared,
    // causing this routine to recognize renamed nodes.
    return ecma.util.defined(this.attributes['key'])
      ? this.attributes['key']
      : this.attributes['key'] = ecma.data.addr_name(this.getAddress());
  };

  Node.setKey = function (key) {
    var parentNode = this.getParentNode();
    var paddr = parentNode
      ? parentNode.getAddress()
      : ecma.data.addr_parent(this.getAddress());
    var addr = ecma.data.addr_join(paddr, key);
    this.setAttribute('key', key);
    this.setAddress(addr);
    this.executeAction({
      'name': 'update',
      'updated': {
        'key': key,
        'addr': addr
      }
    }, this);
  };

  Node.getIndex = function () {
    if (!this.parentNode) return null;
    return this.parentNode.indexOfValue(this);
  };

  Node.getRoot = function () {
    var node = this;
    while (node && node.parentNode) {
      node = node.parentNode;
    }
    return node;
  };

  Node.getDataBridge = function () {
    return this.getRoot().db;
  };

  Node.fetch = function (cb) {
    this.getRoot().db.fetch(this.getAddress(), cb);
  };

  Node.reload = function (cb) {
    this.getRoot().db.getAndFetch(this.getAddress(), cb);
  };

  Node.load = function (cb, bRevalidate) {
    if (bRevalidate) {
      ecma.console.trace('[DEPRECATED] Use .reload (not load+validate)');
      this.getRoot().db.getAndFetch(this.getAddress(), cb);
    } else {
      this.getRoot().db.get(this.getAddress(), cb);
    }
  };

  Node.setParentNode = function (node) {
    return this.parentNode = node;
  };

  Node.getParentNode = function () {
    return this.parentNode;
  };

  Node.getPreviousSibling = function () {
    var parentNode = this.getParentNode();
    if (!parentNode) return null;
    var children = parentNode.values();
    for (var i = 0; i < children.length; i++) {
      if (children[i] === this) {
        return i > 0 ? children[i - 1] : null;
      }
    }
    return null;
  };

  Node.setAttribute = function (name, value) {
    return this.attributes[name] = value;
  };

  Node.getAttribute = function (name) {
    return this.attributes[name];
  };

  Node.removeAttribute = function (name) {
    delete this.attributes[name];
  };

  function _takeIndex (value, parentNode) {
    var prevKey = value.getAttribute('prev');
    var prevIndex = prevKey ? parentNode.indexOfKey(prevKey) : null;
    var index = ecma.util.defined(prevIndex) ? prevIndex + 1 : 0;
    delete value.attributes['prev'];
    return index;
  }

  Node.merge = function (value) {
    var isUpdated = false;
    var updated = {};
    for (var k in this.attributes) {
      if (!(k in value.attributes)) {
        delete this.attributes[k];
        // No callback. (This is used for some mtime/mtime2 checking between
        // stub nodes and then their populated counterparts... I think.)
      }
    }
    for (var k in value.attributes) {
      var v = value.attributes[k];
      if (this.attributes[k] != v) {
        updated[k] = this.attributes[k] = v;
        isUpdated = true;
      }
    }
    if (this.attributes['prev']
        && this.parentNode
        && !this.parentNode.isDataArray()) {
      var index = _takeIndex(this, this.parentNode);
      if (index != this.getIndex()) {
        var key = ecma.data.addr_name(this.getAddress());
        this.parentNode.setValue(key, this, index);
        updated['index'] = index;
        isUpdated = true;
      }
    }
    if (isUpdated) {
      this.executeAction({'name': 'update', 'updated': updated}, this);
    }
    return this;
  };

  Node.mergeRename = function (meta) {
    ecma.lang.assert(meta.old_name == this.getKey());
    this.setKey(meta.new_name);
    var parentNode = this.getParentNode();
    if (parentNode) {
      var currentIndex = this.getIndex();
      var newIndex = currentIndex;
      if (meta.prev) {
        var prevIndex = parentNode.indexOfKey(meta.prev);
        if (ecma.util.defined(prevIndex)) {
          newIndex = prevIndex + 1;
        }
      }
      var result = parentNode.renameValue(
          meta.old_name, meta.new_name, newIndex);
      js.lang.assert(result === this);
      if (newIndex != currentIndex) {
        this.executeAction({
          'name': 'update',
          'updated': {'index': newIndex}
        }, this);
        parentNode.executeAction({
          'name': 'update',
          'updated': {'order': true}
        }, this);
      }
    }
    if (this.isDataContainer()) {
      var baseAddr = this.getAddress();
      this.walk(function (name, node, depth, addr) {
        node.setAttribute('addr', ecma.data.addr_join(baseAddr, addr));
      });
    }
  };

  Node.createValue = function (key, value) {
    ecma.lang.assert(value);
    var index = _takeIndex(value, this);
    var result = this.setValue(key, value, index);
    this.executeAction('create', value, 'new create: ' + key);
    return result;
  };

  Node.replaceValue = function (key, value) {
    var currentValue = this.getValue(key);
    if (currentValue) {
      return currentValue.merge(value);
    } else {
      return this.createValue(key, value);
    }
  };

});
