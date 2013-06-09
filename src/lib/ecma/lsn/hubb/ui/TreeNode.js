/**
 * @namespace hubb.ui
 * @class TreeNode
 * A single item in the list.
 */

ECMAScript.Extend('hubb.ui', function (ecma) {

  var STATE_CANNOT_EXPAND = 0;
  var STATE_EXPANDED = 1;
  var STATE_COLLAPSED = 2;
  var STATE_IS_EMPTY = 3;

  this.TreeNode = function (data, view, name, depth) {
    ecma.data.Node.call(this, data);
    this.view = view;
    this.name = name;
    this.depth = depth;
    this.state = STATE_CANNOT_EXPAND;
    this.isPopulated = false;
    this.isVisible = false;
    this.createUI();
    this.updateUI();
    this.uiDate = null;
  };

  var proto = ecma.lang.createPrototype(ecma.data.Node);

  this.TreeNode.prototype = proto;

  proto.createNode = function (data, view, name, depth) {
    return new ecma.hubb.ui.TreeNode(data, view, name, depth);
  };

  proto.getNodeByAddress = function (addr) {
    var myAddr = this.data.getAddress();
    if (myAddr == addr) return this;
    if (addr.indexOf(myAddr) != 0) return null;
    return this.walk(function (tnode) {
      if (tnode.data.getAddress() == addr) {
        return tnode;
      }
    }, this);
  };

  proto.getAddress = function () {
    return this.data.getAddress();
  };

  proto.getChildByName = function (name) {
    if (!ecma.util.defined(name) || name == '') return this;
    var n = this.firstChild;
    while (n) {
      if (n.name == name) return n;
      n = n.nextSibling;
    }
  };

  proto.createUI = function () {
    this.ui = {};
    this.ui.toggle = ecma.dom.createElement('img', {
      'class': 'toggle',
      'src': ecma.hubb.getIconByName('noexp.png')
    });
    this.ui.icon = ecma.dom.createElement('img', {
      'class': 'icon',
      'src': this.data.getIcon()
    });
    this.ui.name = ecma.dom.createElement('span', {
      'class': 'name',
      'innerHTML': this.name
    });
    var paddingLeft = this.depth ? (((16 + 3) * this.depth) - 3) : 0;
    this.ui.row = ecma.dom.createElement(
      'tr', [
        'th', {'style': {'padding-left': paddingLeft + 'px'}}, [
          this.ui.toggle,
          this.ui.icon,
          this.ui.name
        ]
      ]
    );
    this.ui.detail = [];
    for (var i = 0; i < this.view.detailColumns.length; i++) {
      var td = ecma.dom.createElement('td', {'class': 'detail'+i});
      this.ui.row.appendChild(td);
      this.ui.detail[i] = td;
    }
    this.ui.events = [
      new ecma.dom.EventListener(this.ui.row, 'click', this.onClick, this),
      new ecma.dom.EventListener(this.ui.row, 'dblclick', this.onDblClick, this),
      new ecma.dom.EventListener(this.ui.row, 'select', function(){return false;}),
      new ecma.dom.EventListener(this.ui.row, 'selectstart', function(){return false;}),
      new ecma.dom.EventListener(this.ui.row, 'mousedown', function(){return false;}),
    ];
  };

  proto.refreshUI = function () {
    var mdate = this.data.getDate();
    if ((!this.uiDate && mdate) || (this.uiDate && this.uiDate < mdate)) {
      this.updateUI();
    }
    if (this.parentNode) {
      var prevDNode = this.data.getPreviousSibling();
      var prevTNode = prevDNode ? this.parentNode.getNodeByAddress(prevDNode.getAddress()) : null;
      if (prevTNode && prevTNode !== this.previousSibling) {
        this.parentNode.insertAfter(this, prevTNode);
        this.show(prevTNode.getElement(), true);
      }
    }
  };

  proto.updateUI = function () {
    // Update expanded state
    if (this.view.canExpand(this)) {
      if (this.state == STATE_CANNOT_EXPAND) {
        // Changing from non-expandable to expandable
        this.setState(STATE_COLLAPSED);
        this.ui.toggleEvent =
          new ecma.dom.EventListener(this.ui.toggle, 'click', this.toggle, this);
        ecma.dom.addClassName(this.ui.toggle, 'canexp');
        this.isPopulated = false;
      }
    } else {
      if (this.state != STATE_CANNOT_EXPAND) {
        // Changing from expandable to non-expandable
        this.setState(STATE_CANNOT_EXPAND);
        if (this.ui.toggleEvent) {
          this.ui.toggleEvent.remove()
          this.ui.toggleEvent = null;
        }
        for (var child = this.firstChild; child; child = child.nextSibling) {
          child.remove();
        }
      }
    }
    // Update icon
    var uiIcon = ecma.dom.getAttribute(this.ui.icon, 'src');
    var dataIcon = this.data.getIcon();
    if (uiIcon != dataIcon) {
      ecma.dom.setAttribute(this.ui.icon, 'src', dataIcon);
    }
    // Update display name
    var uiName = ecma.dom.getValue(this.ui.name);
    if (uiName != this.name) {
      ecma.dom.setValue(this.ui.name, this.name);
    }
    // Update detail columns
    for (var i = 0; i < this.ui.detail.length; i++) {
      var td = this.ui.detail[i];
      var cb = this.view.detailColumns[i];
      ecma.lang.callback(cb, null, [this.data, td]);
      this.ui.row.appendChild(td);
    }
    // Record the last time we reflected the data
    this.uiDate = this.data.getDate();
  };

  proto.destroyUI = function () {
    for (var i = 0, evt; evt = this.ui.events[i]; i++) {
      evt.remove();
    }
    this.ui.events = [];
    if (this.ui.toggleEvent) {
      this.ui.toggleEvent.remove()
      this.ui.toggleEvent = null;
    }
    ecma.dom.removeElement(this.getElement());
  };

  proto.onClick = function (event) {
    this.view.onClick(event, this);
  };

  proto.onDblClick = function (event) {
    this.view.onDblClick(event, this);
  };

  proto.getElement = function () {
    return this.ui.row;
  };

  proto.setState = function (state) {
    var name = state == STATE_CANNOT_EXPAND ? 'noexp.png'
      : state == STATE_EXPANDED ? 'isexp.png'
      : state == STATE_COLLAPSED ? 'canexp.png'
      : state == STATE_IS_EMPTY ? 'isempty.png'
      : null;
    ecma.lang.assert(name != null);
    var src = ecma.hubb.getIconByName(name);
    ecma.dom.setAttribute(this.ui.toggle, 'src', src);
    this.state = state;
  };

  proto.toggle = function (event) {
    if (event) ecma.dom.stopEvent(event);
    if (this.state == STATE_EXPANDED) {
      this.collapse();
    } else if (this.state == STATE_COLLAPSED) {
      this.expand();
    } else if (this.state == STATE_IS_EMPTY) {
      this.expand();
    }
  };

  proto.expand = function () {
    if (this.state == STATE_EXPANDED) return;
    if (!this.isPopulated) {
      if (!this.data.hasFetched()) {
        this.data.fetch([function () {
          // avoid infinite recursion on failed requests by only recursing
          // when the fetch command succeeds.
          if (this.data.hasFetched()) return this.expand();
          this.setState(STATE_IS_EMPTY);
        }, this]);
        return;
      } else {
        this.populate();
      }
    }
    if (this.hasChildNodes()) {
      var y = this;
      var x = this.firstChild;
      while (x) {
        y = x.show(y.getElement());
        x = x.nextSibling;
      }
      this.setState(STATE_EXPANDED);
    } else {
      this.setState(STATE_IS_EMPTY);
    }
    this.isVisible = true;
    this.data.fetch();
  };

  proto.populate = function () {
    this.data.iterate(function (k, v) {
      if (this.view.canDisplay(v)) {
        this.appendChild(new ecma.hubb.ui.TreeNode(v, this.view, k, this.depth + 1));
      }
    }, this);
    this.isPopulated = true;
  };

  proto.collapse = function () {
    if (!this.state == STATE_EXPANDED) return;
    var node = this.firstChild;
    while (node) {
      node.hide();
      node = node.nextSibling;
    }
    this.setState(STATE_COLLAPSED);
    this.view.onCollapse();
  };

  proto.hide = function () {
    for (var node = this.firstChild; node; node = node.nextSibling) {
      node.hide();
    }
    ecma.dom.removeElement(this.getElement());
    this.isVisible = false;
  };

  proto.show = function (precedingElement, bUpdate) {
    if (this.isVisible && !bUpdate) return;
    var y = this;
    ecma.dom.insertAfter(y.getElement(), precedingElement);
    this.isVisible = true;
    if (this.state == STATE_EXPANDED) {
      for (var x = this.firstChild; x; x = x.nextSibling) {
        y = x.show(y.getElement());
      }
    }
    return y;
  };

  proto.reindex = function () {
    var child = this.firstChild;
    while (child) {
      child.name = ecma.data.addr_name(child.data.getAddress());
      ecma.dom.setValue(child.ui.name, child.name);
      child.reindex();
      child = child.nextSibling;
    }
    return this;
  };

  proto.remove = function () {
    this.destroyUI();
    while (this.hasChildNodes()) {
      this.firstChild.remove();
    }
    var pnode = this.parentNode;
    if (pnode) {
      var isEmpty = (!this.previousSibling && !this.nextSibling);
      pnode.removeChild(this);
      if (isEmpty) pnode.setState(STATE_IS_EMPTY);
    }
  };

  proto.replace = function (dnode) {
    this.data = dnode;
    this.updateUI();
  };

  proto.createChild = function (dnode) {
    if (!this.isPopulated) return; // this child will be recognized when populated
    var tnode = this.getNodeByAddress(dnode.getAddress());
    if (tnode) {
      if (tnode.data.getType() != dnode.getType()) {
        tnode.replace(dnode);
      }
      return tnode;
    }
    if (!this.view.canDisplay(dnode)) return; // cannot display this item
    var name = ecma.data.addr_name(dnode.getAddress());
    tnode = new ecma.hubb.ui.TreeNode(dnode, this.view, name, this.depth + 1);
    var prevDNode = dnode.getPreviousSibling();
    var prevTNode = prevDNode ? this.getNodeByAddress(prevDNode.getAddress()) : null;
    if (prevTNode) {
      this.insertAfter(tnode, prevTNode);
    } else if (this.firstChild) {
      this.insertBefore(tnode, this.firstChild);
      prevTNode = this;
    } else {
      this.appendChild(tnode);
      prevTNode = this;
    }
    if (this.isVisible) {
      if (this.state == STATE_IS_EMPTY) {
        this.expand();
      }
      if (this.state == STATE_EXPANDED) {
        tnode.show(prevTNode.getElement());
      }
    }
    return tnode;
  };

});
