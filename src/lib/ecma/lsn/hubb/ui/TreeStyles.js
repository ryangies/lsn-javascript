/** @namespace hubb.ui */

ECMAScript.Extend('hubb.ui', function (ecma) {

  var _cssId = ecma.util.randomId('css');

  /**
   * @function initStyles
   */

  this.initStyles = function () {
    var _css = ecma.dom.getElement(_cssId);
    if (_css) return;
    _css = new ecma.dom.StyleSheet(_cssId);
    _css.createRule('html', {'padding':'0', 'margin':'0'});
    _css.createRule('body', {'padding':'0', 'margin':'0'});
    _css.createRule('table.hublist', {
      'border-collapse': 'collapse',
      'width': '100%'
    });
    if (ecma.dom.browser.isGecko) {
      _css.createRule('table.hublist', {'-moz-user-select': 'none'});
    } else if (ecma.dom.browser.isWebKit) {
      _css.createRule('table.hublist', {'-khtml-user-select': 'none'});
    }
    _css.createRule('table.hublist', {'padding':'0', 'margin':'0'});
    _css.createRule('table.hublist tr', {'padding':'0', 'margin':'0'});
    _css.createRule('table.hublist th', {'padding':'0', 'margin':'0'});
    _css.createRule('table.hublist td', {'padding':'0', 'margin':'0', 'white-space': 'nowrap'});
    _css.createRule('table.hublist tr:hover span.name', {
      'text-decoration': 'underline',
      'cursor': 'default'
    });
    _css.createRule('table.hublist tr.selected', {
      'background-color': '#fed'
    });
    _css.createRule('table.hublist th', {
      'text-align': 'left',
      'font-weight': 'normal',
      'white-space': 'nowrap',
      'line-height': '17px',
      'width': '100%'
    });
    _css.createRule('table.hublist th span.name', {'vertical-align': 'middle'});
    _css.createRule('table.hublist th img', {'vertical-align': 'middle'});
    _css.createRule('table.hublist th img.icon', {
      'padding-left': '3px'
    });
    _css.createRule('table.hublist th span.name', {
      'padding-left': '3px'
    });
    _css.createRule('table.hublist img.canexp', {
      'cursor': 'pointer'
    });
  };

});
