/** @namespace lsn.layout */
ECMAScript.Extend('lsn.layout', function (ecma) {

  var BOX = 0;
  var ROW = 1;
  var COLUMN = 2;

  var CDispatcher = ecma.action.ActionDispatcher;

  /**
   * @class Area
   * @param type ROW|BOX|COLUMN
   * @param name <String>
   * @param size [Number]
   * @param options [Object]
   *
   * Options
   *
   *  style_by:     'class'; (Default) Style-sheet rules are specified as .name
   *                'id'; Style-sheet rules are specified as #name
   *
   *  structure:    'flat'; (Default) Origin is viewport
   *                'nested'; Origin is the containing area
   *                'wrap';   No origin, layout is for width or height only
   *
   *  gap:          [top,right,bottom,left]
   *                [top,right+left,bottom]
   *                [top+bottom,right+left]
   *                [top+right+bottom+left]
   */

  /*
   * Note, I tried to improve peformance by setting the last split to use 
   * right/bottom values instead of top/left. It made no difference and 
   * ultimately added many more calculations not to mention code to read.
   */

  this.Area = function (type, name, size, options) {
    CDispatcher.apply(this);
    this.options = ecma.util.overlay({}, options);
    this.type = type;
    this.name = name || this.options.name || ecma.util.randomId('area');
    this.size = size; // Original size definition
    this.ruleName = this.options.style_by == 'id' ? '#' : '.';
    this.ruleName += this.name;
    this.structure = this.options.structure || 'flat';
    this.gap = this.parseGap(this.options.gap);
    this.ratio = null; // Used for proportional dimensions
    this.fixed = null; // Used for fixed dimensions
    this.sumFixed = 0;
    this.sumRatio = 0;
    this.sumGap = {width:0,height:0};
    this.splitType = null;
    this.splits = [];
    this.layouts = [];
    this.hasInitialized = false;
    this.region = {};
  };

  var Area = this.Area.prototype = ecma.lang.createPrototype(CDispatcher);

  Area.getArea = function (name) {
    var result = null;
    if (this.name === name) {
      result = this;
    }
    for (var i = 0; !result && i < this.splits.length; i++) {
      result = this.splits[i].getArea(name);
    }
    for (var i = 0; !result && i < this.layouts.length; i++) {
      result = this.layouts[i].getArea(name);
    }
    return result;
  };

  Area.addArea = function (type, name, size, opts) {
    if (this.splitType && this.splitType !== type) {
      throw new Error('Cannot mix rows and columns');
    }
    if (this.hasInitialized) {
      throw new Error('Cannot create areas after initialization');
    }
    this.splitType = type;
    var options = this.getCascadingOptions();
    if (ecma.util.isArray(opts)) {
      options.gap = opts
    } else {
      ecma.util.overlay(options, opts);
    }
    var area = new ecma.lsn.layout.Area(type, name, size, options);
    this.splits.push(area);
    return area;
  };

  Area.addRow = function (name, size, opts) {
    return this.addArea(ROW, name, size, opts);
  };

  Area.addColumn = function (name, size, opts) {
    return this.addArea(COLUMN, name, size, opts);
  };

  Area.addLayout = function (opts) {
    var options = this.getCascadingOptions();
    if (ecma.util.isArray(opts)) {
      options.gap = opts
    } else {
      ecma.util.overlay(options, opts);
    }
    var layout = new ecma.lsn.layout.Layout(options);
    this.layouts.push(layout);
    return layout;
  };

  /**
   * @function getCascadingOptions
   */

  Area.getCascadingOptions = function () {
    return {
      'style_by': this.options.style_by,
      'structure': this.options.structure
    };
  };

  /**
   * @function parseGap
   * @param spec <Array>
   */

  Area.parseGap = function (spec) {
    var p = {
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'width': 0,
      'height': 0
    };
    if (!spec || spec.length == 0) {
      return p;
    } else if (spec && !ecma.util.isArray(spec)) {
      throw new Error('Not an array: gap');
    } else if (spec.length == 1) {
      p.top = spec[0];
      p.right = spec[0];
      p.bottom = spec[0];
      p.left = spec[0];
    } else if (spec.length == 2) {
      p.top = spec[0];
      p.right = spec[1];
      p.bottom = spec[0];
      p.left = spec[1];
    } else if (spec.length == 3) {
      p.top = spec[0];
      p.right = spec[1];
      p.bottom = spec[2];
      p.left = spec[1];
    } else if (spec.length == 4) {
      p.top = spec[0];
      p.right = spec[1];
      p.bottom = spec[2];
      p.left = spec[3];
    } else {
      throw new Error('Too many values: gap');
    }
    p.width = p.left + p.right;
    p.height = p.top + p.bottom;
    return p;
  };

  Area.allocate = function () {
    var spread = [];
    this.sumGap = {width:0,height:0};
    for (var i = 0, area; area = this.splits[i]; i++) {
      if (!ecma.util.defined(area.size)) {
        spread.push(area);
      } else {
        if (area.size > 0 && area.size < 1) {
          this.sumRatio += area.size;
          area.ratio = area.size;
        } else {
          this.sumFixed += area.size;
          area.fixed = area.size;
        }
      }
      this.sumGap.width += area.gap.width;
      this.sumGap.height += area.gap.height;
    }
    if (spread.length > 0) {
      var free = Math.floor(100 * (1 - this.sumRatio));
      var a = Math.round(free / spread.length);
      var r = free - (spread.length * a);
      for (var i = 0, area; area = spread[i]; i++) {
        var ratio = i == 0 ? (a + r) / 100 : a / 100;
        area.ratio = ratio;
        this.sumRatio += ratio;
      }
    }
  };

  Area.getStyleSheet = function () {
    return ecma.lsn.layout.css;
  };

  Area.updateRule = function () {
    var ruleText = '';
    var ruleRegion = this.getRuleRegion();
    for (name in ruleRegion) {
      var propRuleValue = name + ':' + ruleRegion[name] + 'px;';
      var propRuleName = this.ruleName + '-' + name;
      //js.console.log(propRuleName, propRuleValue);
      this.getStyleSheet().updateRule(propRuleName, propRuleValue);
      ruleText += propRuleValue;
    }
    //js.console.log(this.ruleName, ruleText);
    this.getStyleSheet().updateRule(this.ruleName, ruleText);
    for (var i = 0; i < this.layouts.length; i++) {
      this.layouts[i].update(this.getRegion());
    }
    this.dispatchAction('onUpdate', this);
  };

  Area.initialize = function () {
    this.allocate();
    this.createStyles();
    for (var i = 0, area; area = this.splits[i]; i++) {
      area.initialize();
    }
    for (var i = 0, layout; layout = this.layouts[i]; i++) {
      layout.initialize();
    }
    this.hasInitialized = true;

    this.dispatchAction('onInitialize', this);
  };

  Area.update = function (region) {
    this.setRegion(region, this.getVariableLength());
    this.propagate();
  };

  // Do not add 'overflow: auto;' here
  Area.createStyles = function () {
    if (this.structure == 'wrap') return;
    this.getStyleSheet().createRule(this.ruleName, {
      'position': 'absolute'
    });
  };

  Area.getBoundingBox = function () {
    var region = this.cloneRegion(this.region);
    region.width += this.gap.width;
    region.height += this.gap.height;
    if (this.structure == 'nested' || this.structure == 'wrap') {
      region.left = 0;
      region.top = 0;
    } else {
      region.top -= this.gap.top;
      region.left -= this.gap.left;
    }
    //this.log('{', this.ruleName, region, this.structure);
    return region;
  };

  Area.getRegion = function () {
    var region = this.cloneRegion(this.region);
    if (this.structure == 'nested' || this.structure == 'wrap') {
      region.top = 0;
      region.left = 0;
    }
    return region;
  };

  Area.getRuleRegion = function () {
    return this.structure == 'wrap'
      ? this.splitType == ROW
        ? {'height': this.region.height}
        : {'width': this.region.width}
      : this.cloneRegion(this.region);
  };

  Area.getVariableLength = function () {
    var dim = this.splitType == ROW ? 'height' : 'width';
    return this.region[dim] - this.sumFixed - this.sumGap[dim];
  };

  Area.setRegion = function (region, length) {
    //this.log('>', this.ruleName, region);
    this.region.top = region.top + this.gap.top;
    this.region.left = region.left + this.gap.left;
    this.region.width = this.type === ROW
      ? region.width - this.gap.width
      : this.ratio
        ? Math.floor(length * this.ratio)
        : this.fixed;
    this.region.height = this.type === COLUMN
      ? region.height - this.gap.height
      : this.ratio
        ? Math.floor(length * this.ratio)
        : this.fixed;
    this.updateRule();
    //this.log('<', this.ruleName, this.region, 'r='+this.ratio, 'f='+this.fixed);
    return this.getRegion();
  };

  Area.propagate = function () {
    function _propagate (dim, side) {
      var region = this.getRegion();
      var length = this.getVariableLength();
      var used = 0;
      var fill = null;
      for (var i = 0, area; area = this.splits[i]; i++) {
        var inner = area.setRegion(region, length);
        var outer = area.getBoundingBox();
        if (area.ratio) {
          fill = area;
          used += inner[dim];
        }
        region[side] += outer[dim];
      }
      if (this.sumRatio && fill) {
        var actual = Math.round(length * this.sumRatio);
        var delta = actual - used;
        if (delta > 0 && used > 0) {
          fill.region[dim] += delta;
          fill.updateRule();
        }
      }
      for (var i = 0, area; area = this.splits[i]; i++) {
        area.propagate();
      }
    }
    if (this.splitType === COLUMN) _propagate.apply(this, ['width', 'left']);
    if (this.splitType === ROW) _propagate.apply(this, ['height', 'top']);
  };

  /**
   * @function log
   * @param symbol
   * @param ruleName
   * @param region
   * @params ...
   */

  Area.log = function (/*...*/) {
    var args = ecma.util.args(arguments);
    var r = args[2];
    args[1] = ecma.util.pad(args[1], 10, ' ');
    args[2] = 
      ecma.util.pad(r.top, 4, ' ') + ' ' +
      ecma.util.pad(r.left, 4, ' ') + ' ' +
      ecma.util.pad(r.width, 4, ' ') + ' ' +
      ecma.util.pad(r.height, 4, ' ');
    js.console.log.apply(null, args);
  };

  Area.cloneRegion = function (region) {
    var result = {};
    if ('width' in region) result.width = region.width;
    if ('height' in region) result.height = region.height;
    if ('top' in region) result.top = region.top;
    if ('left' in region) result.left = region.left;
    return result;
  };

});
