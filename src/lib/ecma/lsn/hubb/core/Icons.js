/** @namespace hubb */
ECMAScript.Extend('hubb', function (ecma) {

  var _icons = {};

  {#:for (fn, null) in /res/icons/16x16/nodes/{\.png$}}
  _icons['{#fn}'] = '/res/icons/16x16/nodes/{#fn}';
  {#:end for}
  _icons['loading.png'] = '/res/icons/16x16/nodes/loading.gif';

  /**
   * @function getIconByType
   * Get an icon path given a data type
   */

  this.getIconByType = function (type) {
    if (!type) throw new Error('Missing type for icon');
    var parts = type.split('-');
    var icon = undefined;
    while (!icon && parts.length > 0) {
      var name = parts.join('-') + '.png';
      icon = _icons[name];
      if (!icon && parts.length == 3 && parts[1] == 'multipart') {
        name = parts[0] + '-' + parts[2] + '.png';
        icon = _icons[name];
      }
      parts.pop();
    }
    return icon || _icons['unknown.png'];
  };

  /**
   * @function getIconByName
   */

  this.getIconByName = function (name) {
    return _icons[name];
  };

});
