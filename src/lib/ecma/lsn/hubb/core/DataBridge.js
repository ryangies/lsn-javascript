/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var _db = new Object(); // Instances by root address

  /**
   * @function getInstance2
   * Return the global data-bridge instance.
   *
   *  var db = ecma.hubb.getInstance2();
   */

  this.getInstance2 = function (addr) {
    if (!addr) addr = '/';
    var db = _db[addr];
    if (!db) {
      db = _db[addr] = new ecma.hubb.DataBridge(addr);
    }
    return db;
  };

  /**
   * @function getInstance
   * Return the global data-bridge instance.
   *
   *  var db = ecma.hubb.getInstance();
   */

  this.getInstance = function (addr) {
    if (!addr) addr = '/';
    var db = _db[addr];
    if (!db) {
      // Do not include window.opener as callbacks will fubar across windows.
      var win = ecma.window.top;
      if (win && win.js && win.js.hubb) {
        if (win.js.id != ecma.id) {
          return win.js.hubb.getInstance(addr);
        }
      }
      if (!db) {
        db = _db[addr] = new ecma.hubb.DataBridge(addr);
      }
    }
    return db;
  };

  /**
   * @class DataBridge
   * Client-server data bridge via hub addressing.
   *  var db = new ecma.hubb.DataBridge();
   */

  var CActionDispatcher = ecma.action.ActionDispatcher;

  this.DataBridge = function (addr) {
    CActionDispatcher.apply(this);
    this.validateAddress(addr);
    this.rootAddress = addr;
    this.root = new ecma.hubb.RootNode(this, this.rootAddress);
    this.monitor = new js.util.Monitor();
    this.monitor.setParameter('min_interval', 5000);
    this.monitor.setParameter('elapsed_multiplier', 3);
    this.monitor.addTarget(this, 'autoRefresh');
  };

  var DataBridge = ecma.lang.createPrototype(CActionDispatcher);

  this.DataBridge.prototype = DataBridge;

  DataBridge.getRoot = function () {
    return this.root;
  };

/*
  DataBridge.executeAction = function (action, arg1, arg2) {
    ecma.console.log('dispatch:'+action, arg1 ? arg1.getAddress() : null, '(' + arg2 + ')');
    CActionDispatcher.prototype.executeAction.apply(this, arguments);
  };
*/

  /**
   * @function getNodeByAddress
   * Retrieves a node from the local repository by its address.
   */

  DataBridge.getNodeByAddress = function (addr) {
    return addr == this.rootAddress
      ? this.root
      : this.root.get(this.relativeAddress(addr));
  };

  /**
   * @function validateAddress
   * Throw an exception unless the address is valid.
   *
   *  db.validateAddress(addr);
   *
   * Because addresses are susceptible to translation, they should be as well-
   * formed as possible.  It would be unfortunate if you called delete on:
   *
   *  /files/tmp/
   *
   * and it only deleted:
   *
   *  /files/tmp/index.html
   */

  DataBridge.validateAddress = function (addr) {
    try {
      ecma.lang.assert(addr);
      ecma.lang.assert(addr.match(/^\//));
      ecma.lang.assert(addr == ecma.data.addr_normalize(addr));
    } catch (ex) {
      throw new Error('Address is not valid: ' + addr);
    }
  };

  DataBridge.absoluteAddress = function (addr) {
    if (addr.indexOf(this.rootAddress) == 0) return addr;
    return ecma.data.addr_join(this.rootAddress, addr);
  };

  DataBridge.relativeAddress = function (addr) {
    if (!addr.indexOf(this.rootAddress) == 0) return addr;
    return addr.substr(this.rootAddress.length);
  };

  DataBridge.createStubNode = function (addr, type, mtime) {
    var stub = new ecma.hubb.HashNode();
    stub.setAttribute('addr', addr);
    stub.setAttribute('type', type || 'unknown');
    stub.setAttribute('mtime', mtime || '0');
    return stub;
  };

  /**
   * @function get
   */

  DataBridge.get = function (addr, cb) {
    var node = this.getNodeByAddress(addr);
    if (node && node.hasFetched()) {
      ecma.lang.callback(cb, null, [node]);
    } else {
      this.fetch(addr, cb);
    }
  };

  /**
   * @function getAndFetch
   * Like L<get> however issues a L<fetch> on existing nodes after the 
   * callback. Mostly this is a no-op as the response will be not-modified. 
   * When it is modified, the node knows how to merge itself.
   */

  DataBridge.getAndFetch = function (addr, cb) {
    var node = this.getNodeByAddress(addr);
    if (node && node.hasFetched()) {
      if (cb) ecma.lang.callback(cb, null, [node]);
      this.fetch(addr);
    } else {
      this.fetch(addr, cb);
    }
  };

  /**
   * @function fetch
   * Fetches nodes from the server.
   *
   *  addr = db.fetch(addr);
   *
   * Returns the address which is being fetched.  Because it is normalized, you
   * may want this value to match against the address in the callback.  See
   * L<ecma.data.addr_normalize>.
   */

  DataBridge.fetch = function (addr, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    var datum = this.getNodeByAddress(addr);
    var headers = {'Cache-Control': 'no-fetch'};
    var params = {'root': this.rootAddress};
    if (datum) {
      var mdate = datum.getModifiedDate();
      if (mdate) {
        headers['If-Modified-Since'] = mdate.toUTCString();
        headers['Cache-Control'] = 'max-age=0; must-revalidate';
      }
    }
    _xcmd.call(this, 'fetch', addr, addr, headers, params, cb);
  };

  // Must use paramater hash to include 'origin' argument
  DataBridge.store = function (/*addr, value, cb*/) {
    var args = _args(['target', 'value'], arguments);
    var params = args.shift();
    var cb = args.shift();
    params.target = this.absoluteAddress(params.target);
    this.validateAddress(params.target);
    var datum = this.getNodeByAddress(params.target);
    if (datum) {
      params.mtime = datum.getTimestamp();
      params.origin = datum.getValue();
    } else {
      params.mtime = '0';
    }
    _xcmd2.call(this, 'store', null, params, cb);
  };

  // Must use paramater hash to include 'origins' argument
  DataBridge.update = function (/*addr, values, cb*/) {
    var args = _args(['target', 'values'], arguments);
    var params = args.shift();
    var cb = args.shift();
    params.target = this.absoluteAddress(params.target);
    this.validateAddress(params.target);
    var datum = this.getNodeByAddress(params.target);
    if (datum) {
      params.mtime = datum.getTimestamp();
      params.origins = datum.toObject();
    } else {
      params.mtime = '0';
    }
    _xcmd2.call(this, 'update', null, params, cb);
  };

  function _args (names, args) {
    args = ecma.util.args(args);
    if (!ecma.util.isAssociative(args[0])) {
      // Arguments have not been provided as a parameter hash, create one.
      var params = {};
      for (var i = 0; i < names.length; i++) {
        params[names[i]] = args.shift();
      }
      // Parameter hash is to be the first argument
      args.unshift(params);
    }
    return args;
  }

  /**
   * @function create
   *
   *  create(params, cb);
   *
   *  params:
   *
   *    target
   *    name
   *    type
   *    value
   */

  DataBridge.create = function (/*addr, name, type, cb*/) {
    var args = _args(['target', 'name', 'type'], arguments);
    var params = args.shift();
    var cb = args.shift();

    var name = params.name;
    var addr = this.absoluteAddress(params.target);
    this.validateAddress(addr);
    var addr2 = ecma.data.addr_join(addr, name);
    this.validateAddress(addr2);
    if (ecma.data.addr_parent(addr2) != addr) throw new Error('Invalid name');
    var datum = this.getNodeByAddress(addr2);
    if (datum) throw new Error('Node already exists');

    _xcmd2.call(this, 'create', null, params, cb);
  };

  DataBridge.insert = function (addr, index, src, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    var xcmd = ecma.lsn.hubb.command.createInstance('insert', addr, index, src);
    if (!this.isContiguous(addr)) xcmd.setParameter('branch', 1);
    xcmd.addActionListener('fixup', _onFixup, this);
    xcmd.addActionListener('remove', _onRemove, this);
    xcmd.addActionListener('complete', _onComplete, this);
    xcmd.submit(cb);
  };

  DataBridge.remove = function (addr, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    _xcmd.call(this, 'remove', addr, addr, null, null, cb);
  };

  DataBridge.rename = function (/*addr, name, cb*/) {
    var args = _args(['target', 'name'], arguments);
    var params = args.shift();
    var cb = args.shift();
    params.target = this.absoluteAddress(params.target);
    this.validateAddress(params.target);
    _xcmd2.call(this, 'rename', null, params, cb);
  };

  DataBridge.copy = function (addr, dest, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    this.validateAddress(dest);
    ecma.lang.assert(addr != dest);
    var params = {
      'dest': dest
    };
    _xcmd.call(this, 'copy', addr, dest, null, params, cb);
  };

  DataBridge.move = function (addr, dest, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    dest = this.absoluteAddress(dest);
    this.validateAddress(dest);
    ecma.lang.assert(addr != dest);
    var params = {
      'dest': dest
    };
    _xcmd.call(this, 'move', addr, dest, null, params, cb);
  };

  DataBridge.progress = function (addr, name, id, type, cb) {
    var pnode = this.getNodeByAddress(addr);
    var addr2 = ecma.data.addr_join(addr, name);
    var stub = this.createStubNode(addr2, 'loading');
    if (pnode) pnode.replaceValue(name, stub);
    var xcmd = ecma.lsn.hubb.command.createInstance('progress');
    xcmd.setParameter('id', id);
    xcmd.setParameter('target', addr2);
    xcmd.setParameter('type', type);
    xcmd.addActionListener('status', function (action, stats) {
      var node = stub || this;
      node.dispatchAction(action, stats);
    }, this);
    xcmd.addActionListener('complete', function (action) {
      this.fetch(addr2, cb);
    }, this);
    xcmd.submit();
  };

  DataBridge.download = function (addr, name, uri, bReplace, cb) {
    var replace = bReplace ? '1' : '0';
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    var addr2 = ecma.data.addr_join(addr, name);
    this.validateAddress(addr2);
    if (ecma.data.addr_parent(addr2) != addr) throw new Error('Invalid name');
    var datum = this.getNodeByAddress(addr2);
    if (datum && !bReplace) throw new Error('Node already exists');
    var params = {
      'name': name,
      'uri': uri,
      'replace': replace
    };
    var id = ecma.util.randomId();
    var headers = {'X-Progress-ID': id};
    _xcmd.call(this, 'download', addr, addr2, headers, params);
    this.progress(addr, name, id, 'download', cb);
  };

  DataBridge.reorder = function (addr, value, cb) {
    addr = this.absoluteAddress(addr);
    this.validateAddress(addr);
    var params = {
      'value': value
    };
    _xcmd.call(this, 'reorder', addr, addr, null, params, cb);
  };

  /**
   * isContiguous - Is the address a leaf on a branch we have fetched.
   *
   * If we are working with an address which is not contiguous (we haven't
   * fetched its parent) we use branching.  Branching returns the
   * tree of descendants starting from the trunk.
   *
   * When stub entries (directory listing) are made, the parent node
   * will exist, but its mtime will be zero.  We want to branch in this
   * case too.
   */

  DataBridge.isContiguous = function (addr) {
    if (!addr) return false;
    try {
      var parentAddr = ecma.data.addr_parent(addr);
      var parentNode = this.getNodeByAddress(parentAddr);
      var mtime = parentNode.getStorage().getAttribute('mtime');
      return ecma.util.asInt(mtime) > 0;
    } catch (ex) {
      return false;
    }
  };

  DataBridge.batch = function (values, cb) {
    var xcmd = ecma.lsn.hubb.command.createInstance('batch');
    var branching = {};
    for (var i = 0, args; args = values[i]; i++) {
      if (!ecma.util.isArray(args)) throw new Error('provide an array of arrays');
      var cmd = xcmd.addCommand.apply(xcmd, args);
      var addr = cmd.getParameters()['target'];
      if (!this.isContiguous(addr)) {
        var parentAddr = ecma.data.addr_parent(addr);
        if (!branching[parentAddr]) {
          // Only set branching for the first item under the same address
          cmd.setParameter('branch', 1);
          branching[parentAddr] = 1;
        }
      }
      cmd.addActionListener('fixup', _onFixup, this);
      cmd.addActionListener('reorder', _onReorder, this);
      cmd.addActionListener('remove', _onRemove, this);
      cmd.addActionListener('rename', _onRename, this);
    }
    xcmd.addActionListener('complete', _onComplete, this);
    xcmd.submit(cb);
  };

  DataBridge.startAutoRefresh = function () {
    this.monitor.start(true); // Asynchronous
  };

  DataBridge.stopAutoRefresh = function () {
    this.monitor.stop();
  };

  DataBridge.autoRefresh = function () {
    var root = this.getRoot();
    var commands = [];
    root.walk(function (key, node) {
      if (node.hasFetched() && (node.isDirectory() || node.isFile())) {
        commands.push(['fetch', node.getAddress()]);
      }
    });
    /*
    ecma.console.log(
      'autoRefresh:',
      'fetching', commands.length, 'nodes;',
      '(last-elapsed=' + this.monitor.getLastElapsed() + 'ms)'
    );
    */
    this.batch(commands, [function () {
      this.monitor.resume();
    }, this]);
  };

  // Old style, params as ordered args
  function _xcmd (verb, addr, dest, headers, values, cb) {
    var xcmd = ecma.lsn.hubb.command.createInstance(verb);
    xcmd.addActionListener('fixup', _onFixup, this);
    xcmd.addActionListener('reorder', _onReorder, this);
    xcmd.addActionListener('remove', _onRemove, this);
    xcmd.addActionListener('rename', _onRename, this);
    xcmd.addActionListener('complete', _onComplete, this);
    if (!values) values = {};
    if (addr) {
      values.target = addr;
      xcmd.addr = addr;
    }
    xcmd.setParameters(values);
    xcmd.setHeaders(headers);
    if (!this.isContiguous(dest)) xcmd.setParameter('branch', 1);
    xcmd.submit(cb);
  }

  // New style, params as object
  function _xcmd2 (verb, headers, params, cb) {
    var xcmd = ecma.lsn.hubb.command.createInstance(verb);
    xcmd.addActionListener('fixup', _onFixup, this);
    xcmd.addActionListener('reorder', _onReorder, this);
    xcmd.addActionListener('remove', _onRemove, this);
    xcmd.addActionListener('rename', _onRename, this);
    xcmd.addActionListener('complete', _onComplete, this);
    xcmd.addr = params.target;
    xcmd.setParameters(params);
    xcmd.setHeaders(headers);
    if (!this.isContiguous(params.target)) xcmd.setParameter('branch', 1);
    xcmd.submit(cb);
  }

  function _onComplete (action, xcmd) {
    if (xcmd.verb == 'remove') return;  // already handled in _onRemove
    if (xcmd.verb == 'rename') return;  // already handled in _onRename
    this.executeAction(xcmd.verb, xcmd.result);
  }

  function _onRemove (action, addr, meta) {
    // For data containers, a removed item results in updated storage
    if (meta && meta.mtime) {
      var parentAddr = ecma.data.addr_parent(addr);
      var parentNode = this.getNodeByAddress(parentAddr);
      if (parentNode) {
        var storage = parentNode.getStorage();
        if (storage && storage.isFile()) {
          storage.reload(); // Sync
        }
      }
    }
    // Remove the node and notify
    var xnode = this.getNodeByAddress(addr);
    if (xnode) {
      try {
        xnode.getParentNode().removeValue(xnode.getKey());
      } catch (ex) {
        ///ecma.error.reportError(ex);
      } finally {
        this.executeAction('remove', xnode);
      }
    }
  }

  function _onRename (action, meta) {
    // Rename the node
    var node = this.getNodeByAddress(meta.old_addr);
    if (node) {
      try {
        action.dispatcher.result = node;
        node.mergeRename(meta);
      } catch (ex) {
        ///ecma.error.reportError(ex);
      } finally {
        this.executeAction('rename', node);
      }
    }
    // For data containers, a renamed item results in updated storage
    var storage = this.getNodeByAddress(meta.storage_addr);
    if (storage && storage.isFile()) {
      storage.reload(); // Sync
    }
  }

  function _onReorder (action, addr, keys, meta) {
    var xcmd = action.dispatcher;
    var node = this.getNodeByAddress(addr);
    if (node) {
      node.sortByKey(keys);
      node.getStorage().setAttribute('mtime', meta.mtime);
      xcmd.result = node;
    }
  }

  function _onFixup (action, node) {
    var xcmd = action.dispatcher;
    if (!node) return;
    var addr = node.getAddress();
    var currentNode = this.getNodeByAddress(addr);
    var nodeMtime = ecma.util.asInt(node.getAttribute('mtime'));
    var hasModified = false;
    var storage;
    if (currentNode) {
      var nodeSum = node.getAttribute('checksum');
      var currentMtime = ecma.util.asInt(currentNode.getTimestamp());
      if (nodeSum) {
        var currentSum = currentNode.getAttribute('checksum');
        if (currentSum !== nodeSum) {
          currentNode.merge(node);
          hasModified = true;
        } else {
          // Recognized touched files
          if (!currentMtime || (currentMtime < nodeMtime)) {
            currentNode.setAttribute('mtime', nodeMtime);
            hasModified = true;
          }
        }
      } else {
        if (!currentMtime || (currentMtime < nodeMtime)) {
          currentNode.merge(node);
          hasModified = true;
        }
      }
      storage = currentNode.getStorage();
    } else {
      var parentAddr = ecma.data.addr_parent(addr);
      var parentNode = this.getNodeByAddress(parentAddr);
      if (parentNode) {
        var key = ecma.data.addr_name(addr);
        currentNode = parentNode.createValue(key, node);
        storage = parentNode.getStorage();
        hasModified = true;
      } else {
        // Not a contiguous node!
      }
    }
    // When data within a storable file is changed, the file as a whole
    // can [and needs to] recognize the updated mtime. Otherwise a subsequent 
    // store on another datum will be denied because the file has been 
    // modified.
    if (hasModified && storage && storage !== currentNode && storage.isFile()) {
      storage.reload(); // Sync
//    storage.setAttribute('mtime', nodeMtime);
      /*
      var baseAddr = storage.getAddress();
      storage.walk(function (name, child, depth, addr) {
        child.setAttribute('mtime', nodeMtime);
      });
      */
    }
    xcmd.result = currentNode;
  }

});
