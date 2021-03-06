ECMAScript.Extend('hubb.ui', function (ecma) {

  var CTreeView = ecma.hubb.ui.TreeView;
  var proto = ecma.lang.createPrototype(CTreeView);

  /**
   * @class TreeBox
   */

  this.TreeBox = function (rootAddr) {
    CTreeView.apply(this, [rootAddr]);
    this.rootAddr = rootAddr;
  };

  this.TreeBox.prototype = proto;

  proto.canExpand = function (tnode) {
    return tnode.data.isDirectory();
  };

  proto.onDblClick = function (event, tnode) {
    if (!tnode.data.isDirectory()) {
      this.hide();
      return CTreeView.prototype.selectNode.apply(this, [tnode, event]); // userselect
    }
    return CTreeView.prototype.onDblClick.apply(this, arguments);
  };

  proto.selectNode = function (tnode, event) {
    ecma.dom.removeClassName(this.ui.rm, 'disabled');
    ecma.dom.removeClassName(this.ui.upload, 'disabled');
    ecma.dom.removeClassName(this.ui.mkdir, 'disabled');
    CTreeView.prototype.selectNode.apply(this, [tnode]); // no userselect
  };

  proto.deselectNode = function (tnode) {
    ecma.dom.addClassName(this.ui.rm, 'disabled');
    ecma.dom.addClassName(this.ui.upload, 'disabled');
    ecma.dom.addClassName(this.ui.mkdir, 'disabled');
    CTreeView.prototype.deselectNode.apply(this, arguments);
  };

  proto.attach = function (pElem, w, h) {
    this.createUI(w, h);
    pElem = ecma.dom.getElement(pElem);
    ecma.dom.replaceChildren(pElem, [this.getElement()]);
    return this;
  };

  proto.show = function (pElem) {
    var box = this.getElement();
    ecma.dom.setStyle(box, 'visibility', 'visible');
    return this;
  };

  proto.getSelectedDirectory = function () {
    var tnode = this.getSelection()[0];
    if (!tnode) return;
    var dnode = tnode.data;
    while (dnode && !dnode.isDirectory()) {
      dnode = dnode.parentNode;
    }
    return dnode;
  };

  proto.onUpload = function (event) {
    ecma.dom.stopEvent(event);
    var dnode = this.getSelectedDirectory();
    if (!dnode) return;
    if (!this.uplDlg || this.uplDlg.isLoading) {
      this.uplDlg = new ecma.hubb.ui.UploadDialog();
    }
    this.uplDlg.show(dnode);
  };

  proto.onMkdir = function (event) {
    ecma.dom.stopEvent(event);
    var dnode = this.getSelectedDirectory();
    if (!dnode) return;
    if (!this.mkdirDlg) {
      this.mkdirDlg = new ecma.hubb.ui.NewDirectoryDialog();
    }
    this.mkdirDlg.show(dnode);
  };

  proto.onDelete = function (event) {
    ecma.dom.stopEvent(event);
    var tnode = this.getSelection()[0];
    if (!tnode) return;
    var addr = tnode.getAddress();
    if (confirm('Are you sure you want to delete: ' + addr)) {
      ecma.hubb.getInstance().remove(addr);
    }
  };

  proto.onToggle = function (event) {
    ecma.dom.stopEvent(event);
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  };

  proto.getElement = function () {
    return this.ui.box;
  };

  proto.createUI = function (w, h) {
    try {
      this.expand(this.rootAddr, [function () {
        this.select(this.rootAddr);
      }, this]);
    } catch (ex) {
      // Control value is not a valid data node
    }
    this.ui.listElem = ecma.dom.createElement('div', {
      'style':{
        'overflow':'auto',
        'height':h ? h + 'px' : 'auto'
      }
    }, [this.ui.outer]);
    this.ui.upload = ecma.dom.createElement('a', {
      'onClick':[this.onUpload, this],
      'innerHTML':'Upload',
      'class':'disabled',
      'style':{'cursor':'pointer'}
    });
    this.ui.mkdir = ecma.dom.createElement('a', {
      'onClick':[this.onMkdir, this],
      'innerHTML':'New Folder',
      'class':'disabled',
      'style':{'cursor':'pointer'}
    });
    this.ui.rm = ecma.dom.createElement('a', {
      'onClick':[this.onDelete, this],
      'innerHTML':'Delete',
      'class':'disabled',
      'style':{'cursor':'pointer'}
    });
    this.ui.box = ecma.dom.createElement('div', {
      'style': {
        'visibility':'hidden',
        'width':w ? w + 'px' : 'auto'
      }
    }, [
      'div', {
        'style':{
          'border-top':'1px solid gray',
          'border-left':'1px solid gray',
          'border-right':'1px solid gray',
          'border-bottom':'1px solid gray',
          'background-color':'#fefefe'
        }
      }, [
        this.ui.listElem,
        'div', {
          'style':{
            'padding':'2px',
            'font-size':'.8em',
            'border-top':'1px solid gray'
          }
        }, [
          'div', {
            'align':'right'
          }, [
            this.ui.upload, '#text', {'nodeValue':' | '},
            this.ui.mkdir, '#text', {'nodeValue':' | '},
            this.ui.rm
          ]
        ]
      ]
    ]);
  };

});
