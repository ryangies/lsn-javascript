/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class StyleSheet
   * Wrapper class for cascading style sheets.
   *
   *  var css = new ecma.dom.StyleSheet();
   *  var css = new ecma.dom.StyleSheet(props);
   *
   *  props = {
   *    'id': 'element-id',
   *    'position': 'first|last' // dom position relative to other STYLE nodes
   *  };
   *
   *  var css = new ecma.dom.StyleSheet();
   *  css.createRule('div.foo', {'border', '1px solid blue'});
   *  css.updateRule('div.foo', {'width': '200px', 'height': '30em'});
   *
   * Internet Explorer (v7 at least) does not honor rule-names separated with a
   * comma.  This will issue an exception:
   *
   *  css.createRule('html, body', {'background', 'transparent'});
   *
   */
  this.StyleSheet = function(params) {
    if (!params) params = {};
    if (!ecma.util.isAssociative(params)) {
      params = {'id': params}; // depricated usage, first arg was id
    }
    this.position = params.position || 'last';
    this.id = params.id || ecma.util.randomId('css');
    this.style = undefined;
    this.sheet = undefined;
    this.cssRulesByName = undefined;
  };

  this.StyleSheet.prototype = {

/*
    toString: function () {
      var result = '';
      if (!this.cssRulesByName) return result;
      for (var name in this.cssRulesByName) {
        result += this.cssRulesByName[name].rule.cssText;
      }
      return result;
    },

    importStyles: function (css) {
      ecma.console.log('importStyles', css);
    },
*/

    vivify: function () {
      this.style = ecma.dom.getElement(this.id) || ecma.dom.createElement(
        'style', {
          id: this.id,
          type: 'text/css',
          rel: 'stylesheet',
          media: 'screen'
        });
      var elems = ecma.dom.selectElements(
        'head > style, head > link[rel="stylesheet"]'
      );
      if (elems.length) {
        if (this.position == 'first') {
          ecma.dom.insertBefore(this.style, elems.shift());
        } else {
          ecma.dom.insertAfter(this.style, elems.pop());
        }
      } else {
        ecma.dom.getHead().appendChild(this.style);
      }
      this.sheet = this.style.sheet || this.style.styleSheet;
      this.cssRulesByName = {};
    },

    objToStr: function(obj, opts) {
      var result = '';
      for (var name in obj) {
        if (opts && ecma.util.defined(opts.exclude)) {
          if (name.match(opts.exclude)) {
            continue;
          }
        }
        result += name + ':' + this.clarifyValue(name, obj[name]) + ';';
      }
      return result;
    },

    strToObj: function(str) {
      str = str.replace(/\r?\n\r?\s*/g, '');
      var result = {};
      var items = str.split(';');
      for (var i = 0; i < items.length - 1; i++) {
        var key = items[i].split(/:/, 1);
        var value = items[i].substr(key[0].length + 1);
        value = value.replace(/^\s+/, '');
        var name = key[0];
        result[name] = value;
      }
      return result;
    },

    clarifyValue: function(name, value) {
      return typeof(value) === 'number'
        ? name.match(/(width|height|top|right|bottom|left)$/)
          ? value + 'px' // default units (required)
          : value + '' // toString (numbers not allowed)
        : value;
    },

    /*
     * createRules - Create multiple rules when the name contains commas
     * Update an existing style rule, or create a new one if none exists.
     *  var rules = css.createRules('h1, h2', {'font-size': '1.8em'});
     *  var rules = css.createRules('h1, h2', 'font-size: 1.8em;');
     * Provided for IE compatibility.
     */

    createRules: function (name, props) {
      var names = name.split(/,\s*/);
      var rules = [];
      for (var i = 0; i < names.length; i++) {
        rules.push(this.createRule(names[i], props));
      }
      return rules;
    },

    createRulesFromData: function (data) {
      var rules = [];
      while (data.length) {
        var def = data.shift();
        rules = rules.concat(this.createRules(def.selector, def.rule));
      }
      return rules;
    },

    /*
     * updateRules - Update multiple rules when the name contains commas
     * Update an existing style rule, or create a new one if none exists.
     *  var rules = css.updateRules('h1, h2', {'font-size': '1.8em'});
     *  var rules = css.updateRules('h1, h2', 'font-size: 1.8em;');
     * Provided for IE compatibility.
     */

    updateRules: function (name, props) {
      var names = name.split(/,\s*/);
      var rules = [];
      for (var i = 0; i < names.length; i++) {
        rules.push(this.updateRule(names[i], props));
      }
      return rules;
    },

    cssNameToJsName: function(name) {
      if (name == 'float') return 'cssFloat';
      if (name == 'class') return 'className';
      return ecma.util.asCamelCaseName(name);
    },

    jsNameToCssName: function(name) {
      if (name == 'cssFloat') return 'float';
      if (name == 'className') return 'class';
      return ecma.util.asHyphenatedName(name);
    },

    /**
     * @function createRule
     * Create a new style rule.
     *  var rule = css.createRule('body', {'background': '#def'});
     *  var rule = css.createRule('body', 'background:#def');
     */
    createRule: function(name, props) {
      if (!this.style) this.vivify();
      var str = ecma.util.isAssociative(props) ? this.objToStr(props) : props;
      var rule = null;
      var idx = -1;
      if (ecma.util.defined(this.sheet.addRule)) {
        /* ie */
        idx = this.sheet.rules.length;
        this.sheet.addRule(name, str);
        rule = this.sheet.rules[idx];
      } else if(ecma.util.defined(this.sheet.insertRule)) {
        idx = this.sheet.cssRules.length;
        this.sheet.insertRule(name +' {' + str + '}', idx);
        rule = this.sheet.cssRules[idx];
      }
      this.cssRulesByName[name] = {'rule': rule, 'index': idx};
      return rule;
    },

    /**
     * @function updateRule
     * Update an existing style rule, or create a new one if none exists.
     *  var rule = css.updateRule('h1', {'font-size': '1.8em'});
     *  var rule = css.updateRule('h1', 'font-size: 1.8em;');
     */
    updateRule: function(name, props) {
      if (!this.style) this.vivify();
      var rinfo = this.cssRulesByName[name];
      var rule = rinfo ? rinfo.rule : undefined;
      if (rule) {
        if (!ecma.util.isAssociative(props)) props = this.strToObj(props);
        for (var propName in props) {
          var value = this.clarifyValue(propName, props[propName]);
          ecma.dom.setStyle(rule, propName, value);
        }
      } else {
        rule = this.createRule(name, props);
      }
      return rule;
    },

    deleteRule: function(rule) {
      if (!this.style) return;
      var found = false;
      for (var name in this.cssRulesByName) {
        var rinfo = this.cssRulesByName[name];
        if (rinfo.rule === rule) {
          if (ecma.util.defined(this.sheet.removeRule)) {
            this.sheet.removeRule(rinfo.index);
          } else {
            this.sheet.deleteRule(rinfo.index);
          }
          delete this.cssRulesByName[name];
          found = true;
        } else if (found) {
          rinfo.index--;
        }
      }
      return found;
    }

  };

});
