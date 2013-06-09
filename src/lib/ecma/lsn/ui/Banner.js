/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var _css = null;

  function initBannerStyles () {
    if (_css) return;
    _css = new ecma.dom.StyleSheet();
    _css.createRule('.bnrViewport', {
      'overflow':'hidden',
      'position':'relative'
    });
    _css.createRule('.bnrItems', {
      'position':'absolute',
      'border-collapse':'collapse',
      'border-spacing':'0',
      'margin':'0',
      'padding':'0'
    });
    _css.createRule('.bnrCell', {
      'vertical-align':'center',
      'margin':'0',
      'padding':'0'
    });
  };

  var CElement = ecma.lsn.ui.Element;
  var CSequencer = ecma.fx.Sequencer;

  var proto = ecma.lang.createPrototype(CElement, CSequencer);

  /**
   * @class Banner
   */

  this.Banner = function (interval) {
    initBannerStyles();
    CElement.apply(this);
    CSequencer.apply(this, [interval || 1000]);
    this.createUI();
    this.frames = [];
    this.addActionListener('select', this.onSelect, this);
    this.addActionListener('deselect', this.onDeselect, this);
    this.addActionListener('loop', this.onLoop, this);
  };

  this.Banner.prototype = proto;

  proto.attach = function (div, table, row) {
    div = ecma.dom.getElement(div);
    table = ecma.dom.getElement(table);
    row = ecma.dom.getElement(row);
    this.setElement('div_vp', div);
    this.setElement('table_items', table);
    this.setElement('tr_items', row);
    var nodes = row.getElementsByTagName('td');
    for (var i = 0, cell; cell = nodes[i]; i++) {
      CSequencer.prototype.addItem.call(this, cell);
    }
  };

  proto.sizeTo = function (elem) {
    elem = ecma.dom.getElement(elem);
    var vp = this.getElement('div_vp');
    ecma.dom.setStyle(vp, 'width', ecma.dom.getInnerWidth(elem) + 'px');
    ecma.dom.setStyle(vp, 'height', ecma.dom.getInnerHeight(elem) + 'px');
  };

  proto.getRootElement = function (elem) {
    return this.getElement('div_vp');
  };

  proto.createUI = function () {
    this.createElement('div_vp', {'class':'bnrViewport'}, [
      this.createElement('table_items', {'class':'bnrItems'}, [
        'tbody', [this.createElement('tr_items')]
      ]),
      this.getElement('table_items')
    ]);
  };

  proto.onClickNext = function (event) {
    this.next();
  };

  proto.onClickPrev = function (event) {
    this.prev();
  };

  proto.onClickSelect = function (event, idx) {
    this.select(idx);
  };

  proto.onClickStart = function (event) {
    this.start();
  };

  proto.onClickStop = function (event) {
    this.stop();
  };

  proto.addItem = function (item) {
    var td = this.createElement('td', {'class': 'bnrCell'}, [item]);
    this.getElement('tr_items').appendChild(td);
    return CSequencer.prototype.addItem.call(this, td);
  };

  proto.getMovement = function (idx) {
    var left = 0;
    for (var i = 0; i < idx; i++) {
      var td = this.getItem(i);
      left += ecma.dom.getWidth(td);
    }
    left *= -1;
    var tbl = this.getElement('table_items');
    var pos = ecma.util.asInt(ecma.dom.getStyle(tbl, 'left'));
    return [pos, left]; // from, to
  }

  proto.onSelect = function (action, target, idx) {
//  ecma.console.log('select', idx);
    var left = this.getMovement(idx);
    if (left[0] != left[1]) {
      var tbl = this.getElement('table_items');
      var ani = new ecma.fx.Animator(25, 500);
      ani.addEffect('style', tbl, 'left', left[0], left[1], 'px');
      ani.addEffect('style', target, 'opacity', 0, 1);
      ani.start();
    }
  };

  proto.onDeselect = function (action, target) {
//  ecma.console.log('deselect', action.getDispatcher().getIndex());
  };

  proto.loop = function (idx) {
    var left = this.getMovement(idx);
    var tbl = this.getElement('table_items');
//  ecma.console.log('loop', left[0], left[1]);
    new ecma.fx.effects.Style(tbl, 'opacity', 1, 0, null, 250).start([function () {
      ecma.dom.setStyle(tbl, 'left', left[1] + 'px');
      new ecma.fx.effects.Style(tbl, 'opacity', 0, 1, null, 250).start([this.select, this, [idx]]);
    }, this]);
  };

});
