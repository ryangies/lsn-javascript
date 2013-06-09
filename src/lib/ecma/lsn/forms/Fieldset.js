/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  /**
   * @class Fieldset
   */

  this.Fieldset = function (def, vals) {
    this.fields = [];
    this.heading = def.getValue('heading');
    def.getValue('fields').iterate(function (k, v) {
      var name = v.getValue('name') ? v.getValue('name') : k;
      var value = vals ? vals.get(name) : undefined;
      this.fields.push(new ecma.lsn.forms.Field(name, v, value));
    }, this);
  };

  var _proto = this.Fieldset.prototype = ecma.lang.createPrototype();

});
