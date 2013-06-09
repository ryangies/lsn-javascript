/**
 * @namespace hubb.ui
 * @class TreeView
 * A widget which reflects and browses server directories files and data.
 */

ECMAScript.Extend('hubb.ui', function (ecma) {

  this.TreeView = function (addr) {
    ecma.action.ActionDispatcher.apply(this);
    this.id = ecma.util.incrementalId('TreeView');
    this.db = ecma.hubb.getInstance();
    this.root = null;
    this.rootAddress = '/';
    this.ui = {};
    this.ui.inner = ecma.dom.createElement('tbody');
    this.ui.outer = ecma.dom.createElement('table', {'class': 'hublist'}, [this.ui.inner]);
    this.selection = [];
    this.detailColumns = []; // array of callback functions which populate details
    ecma.hubb.ui.initStyles();
    if (addr) this.setRootAddress(addr);
  };

  var proto = ecma.lang.createPrototype(ecma.action.ActionDispatcher);

  this.TreeView.prototype = proto;

  proto.getRootAddress = function () {
    return this.rootAddress;
  };

  proto.setRootAddress = function (addr) {
    var newAddr = ecma.data.addr_normalize(addr);
    if (newAddr != addr) throw new Error('Root address is not normalized');
    this.rootAddress = newAddr;
    if (this.root) {
      this.root.remove();
      this.root = null;
      this.deselect();
      this.initRoot(); // Presumes this node has been fetched
    }
  };

  proto.getElement = function () {
    return this.ui.outer;
  };

  proto.getScrollableParent = function () {
    var elem = this.ui.outer;
    var elemScroll = null;
    var body = ecma.dom.getBody();
    while (!elemScroll && elem) {
      var overflow = ecma.dom.getStyle(elem, 'overflow');
      if (overflow && overflow.match(/auto|scroll/i)) {
        elemScroll = elem;
      } else {
        elem = elem == body ? null : elem.parentNode;
      }
    }
    return elemScroll || body;
  };

  proto.expand = function (addr, cb) {
    if (addr.indexOf(this.rootAddress) != 0) throw new Error('Address outside of root');
    var tnode = this.getNodeByAddress(addr);
    if (tnode) {
      this.onExpand(tnode.data, cb);
    } else {
      this.db.fetch(addr, [this.onExpand, this, [cb]]);
    }
  };

  proto.onExpand = function (dnode, cb) {
    this.initRoot();
    var addr = dnode.getAddress().substr(this.rootAddress.length);
    var parts = ecma.data.addr_split(addr);
    var tnode = this.root;
    for (var i = 0; i < parts.length; i++) {
      tnode = tnode.getChildByName(parts[i]);
      tnode.expand();
    }
    if (cb) ecma.thread.spawn(cb, this, [dnode]);
  };

  proto.select = function (addr) {
    if (addr.indexOf(this.rootAddress) != 0) throw new Error('Address outside of root');
    this.deselect();
    var tnode = this.getNodeByAddress(addr);
    if (tnode) {
      this.onSelect(tnode.data);
    } else {
      this.db.fetch(addr, [this.onSelect, this]);
    }
  };

  proto.onSelect = function (dnode) {
    if (!dnode) return;
    var pdnode = dnode.getParentNode() || dnode;
    this.onExpand(pdnode);
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (tnode) {
      this.selectNode(tnode);
      this.scrollTo(tnode);
    }
  };

  proto.scrollTo = function (tnode) {
    var se = this.getScrollableParent(); // scroll elem
    var sh = ecma.dom.getHeight(se); // scroll height
    var st = se.scrollTop; // scroll top
    var te = tnode.getElement(); //  target elem
    var tt = ecma.dom.getTop(te) - ecma.dom.getTop(se); // target top
    var tb = ecma.dom.getBottom(te) - ecma.dom.getTop(se); // target bottom
    if (tb > (st + sh) || (tt < st)) {
      se.scrollTop = ecma.util.asInt(tt - (sh/2));
    }
  };

  proto.destroy = function () {
    this.destroyRoot();
    this.destroyListeners();
  };

  proto.initRoot = function () {
    if (this.root) return;
    var dnode = this.db.root.get(this.rootAddress);
    this.root = new ecma.hubb.ui.TreeNode(dnode, this, this.rootAddress, 0);
    var rootElem = this.root.getElement();
    this.ui.inner.appendChild(rootElem);
    /* TODO, add get/set hideRoot
    if (this.hideRoot) {
      ecma.dom.setStyle(rootElem, 'display', 'none');
    }
    */
    this.root.expand();
    this.initListeners();
  };

  proto.destroyRoot = function () {
    if (this.root) this.root.remove();
  };

  proto.initListeners = function () {
    this.db.addActionListener('log', this.onLog, this);
    this.db.addActionListener('fetch', this.onFetch, this);
    this.db.addActionListener('create', this.onCreate, this);
    this.db.addActionListener('remove', this.onRemove, this);
    this.db.addActionListener('change', this.onChange, this);
    this.db.addActionListener('update', this.onUpdate, this);
    this.db.addActionListener('store', this.onStore, this);
    this.db.addActionListener('replace', this.onReplace, this);
    this.db.addActionListener('status', this.onStatus, this);
  };

  proto.destroyListeners = function () {
    this.db.removeActionListener('log', this.onLog, this);
    this.db.removeActionListener('fetch', this.onFetch, this);
    this.db.removeActionListener('create', this.onCreate, this);
    this.db.removeActionListener('remove', this.onRemove, this);
    this.db.removeActionListener('change', this.onChange, this);
    this.db.removeActionListener('update', this.onUpdate, this);
    this.db.removeActionListener('store', this.onStore, this);
    this.db.removeActionListener('replace', this.onReplace, this);
    this.db.removeActionListener('status', this.onStatus, this);
  };

  proto.getNodeByAddress = function (addr) {
    return this.root ? this.root.getNodeByAddress(addr) : null;
  };

  proto.onCreate = function (action, dnode, msg) {
//  this.logMessage('onCreate:', msg || 'unknown');
    ecma.lang.assert(dnode);
    var pdnode = dnode.getParentNode();
    var ptnode = this.getNodeByAddress(pdnode.getAddress());
    if (ptnode) ptnode.createChild(dnode);
  };

  proto.onRemove = function (action, dnode, msg) {
//  this.logMessage('onRemove:', dnode.getAddress(), msg || 'unknown');
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    this.deselectNode(tnode);
    tnode.remove();
    var pnode = tnode.parentNode;
    if (pnode && ecma.util.isa(pnode.data, ecma.hubb.ArrayNode)) {
      pnode.reindex();
    }
  };

  proto.onFetch = function (action, dnode, why) {
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    tnode.refreshUI();
  };

  proto.onChange = function (action, dnode) {
//  this.logMessage('node has changed value');
  };

  proto.onUpdate = function (action, dnode) {
//  this.logMessage('node has updated attributes');
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    tnode.updateUI();
  };

  proto.onReplace = function (action, dnode) {
    // This datum has replaced what was at its address
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (!tnode) return;
    this.deselectNode(tnode);
    tnode.replace(dnode);
  };

  proto.onStore = function (action, dnode) {
  };

  proto.onStatus = function (action, stats, msg) {
//  this.logMessage('status:', stats.display.message);
    var tnode = this.getNodeByAddress(stats.addr);
    if (!tnode) return;
    ecma.dom.setValue(tnode.ui.name, '(' + stats.percent + '%) ' + tnode.name);
  };

  proto.onLog = function (action, dnode, msg) {
    this.logMessage('LOG:', msg, dnode.getAddress());
  };

  proto.logMessage = function () {
    var args = ecma.util.args(arguments);
    args.unshift(this.id + ':');
    ecma.console.log.apply(null, args);
  }

  proto.onCollapse = function (tnode) {
    var sel = this.getSelection();
    for (var i = 0, n; n = sel[i]; i++) {
      if (!n.isVisible) this.deselectNode(n);
    }
  };

  // API - Behavior

  /**
   * @function canExpand
   * Informs the node that it should enbable expand/collapse functions.
   *
   * @param tnode <ecma.hubb.ui.TreeNode> The node in question
   *
   * Return either C<true> or C<false>. By default we use the data-node's logic.
   * You would want to override this if, for instance, you're creating a file-
   * chooser and you don't want multipart or data file to expand.
   */

  proto.canExpand = function (tnode) {
    return tnode.data.canExpand();
  };

  /**
   * @function canDisplay
   * Indicates whether a particular data-node should be displayed.
   *
   * @param dnode <ecma.hubb.Node> Data-node which is in question
   *
   * Return either C<true> or C<false>.  By default true is always returned.
   */

  proto.canDisplay = function (dnode) {
    return true;
  };

  /**
   * @function onClick
   * Respond to a click.
   *
   * @param event <Event>
   * @param tnode <ecma.hubb.ui.TreeNode> Node which is being clicked
   *
   * By default we clear the current selection and select the node.
   */

  proto.onClick = function (event, tnode) {
    this.deselect();
    this.selectNode(tnode, event);
    ecma.dom.stopEvent(event);
  };

  /**
   * @function onDblClick
   * Respond to a double-click event.
   *
   * @param event <Event>
   * @param tnode <ecma.hubb.ui.TreeNode> Node which is being double-clicked
   *
   * By default we toggle the item.
   */

  proto.onDblClick = function (event, tnode) {
    if (ecma.dom.browser.isOpera) ecma.dom.clearSelection();
    ecma.dom.stopEvent(event);
    tnode.toggle();
  };

  // API - Selection

  /**
   * @function getSelection
   * Return the selection array.
   *
   *  var array = tview.getSelection();
   *
   * By default we do only select one node at time.
   */

  proto.getSelection = function () {
    return this.selection;
  };

  /**
   * @function getSelectedNode
   * Return the last-selected node.
   *
   *  var tnode = tview.getSelectedNode()
   */

  proto.getSelectedNode = function () {
    if (!this.selection.length) return null;
    return this.selection[this.selection.length - 1];
  };

  /**
   * @function getFocusNode
   * Return the node with the focus.
   *
   *  var tnode = tview.getFocusNode()
   *
   * TODO: The focus is different than the selection, which will allow
   * keyboard navigation (up/down) for movement and a key (space/enter) for
   * selection.  The focus node is then the one which has focus but is not
   * necessarily selected.
   */

  proto.getFocusNode = function () {
    throw new Error('Not implemented');
  };

  /**
   * @function getAnchorNode
   * Return the first-selected node
   *
   *  var tnode = tview.getAnchorNode()
   */

  proto.getAnchorNode = function () {
    return this.selection[0];
  };

  /**
   * @function selectNode
   * Select the provided node
   *
   * @param tnode <ecma.hubb.ui.TreeNode> Node to select
   * @param event <Event> Defines this as a user-invoked action
   */

  proto.selectNode = function (tnode, event) {
    ecma.lang.assert(tnode != null);
    ecma.dom.addClassName(tnode.getElement(), 'selected');
    this.selection.push(tnode);
    this.dispatchAction('select', tnode);
    if (event) {
      this.dispatchAction('userselect', tnode, event);
    } else {
      if (tnode.data.isDirectory()) this.onExpand(tnode);
      this.dispatchAction('autoselect', tnode);
    }
  };

  /**
   * @function deselect
   * Deselect all nodes.
   *
   *  tview.deselect();       // deselect all
   */

  proto.deselect = function (tnode) {
    while (this.selection.length) {
      this.deselectNode(this.selection[0]);
    }
  };

  /**
   * @function deselectNode
   * Deselect the specified node.
   *
   *  tview.deselectNode(tnode);  // deselect just that node
   *
   * @param tnode <ecma.hubb.ui.TreeNode> Node to deselect
   */

  proto.deselectNode = function (tnode) {
    ecma.lang.assert(tnode != null);
    ecma.dom.removeClassName(tnode.getElement(), 'selected');
    for (var i = 0, n; n = this.selection[i]; i++) {
      if (n === tnode) {
        this.selection.splice(i, 1);
        this.dispatchAction('deselect', tnode);
        break;
      }
    }
  };

});
