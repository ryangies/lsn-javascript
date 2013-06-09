/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  /**
   * @class Field
   */

  this.Field = function (name, data, value) {
    this.name = name;
    this.original = ecma.util.defined(value) && value != '' ? value : undefined;
    this.model = this.loadFieldData(data);
    this.id = this.createId();
    this.adaptor = undefined;
  };

  var _proto = this.Field.prototype = ecma.lang.createPrototype();

  _proto.createId = function () {
    return ecma.util.randomId(this.model.type + '_');
  };

  _proto.loadFieldData = function (data) {
    var model = {'type': 'text', 'value': '', 'label':'', 'name': this.name};
    ecma.util.overlay(model, data.toObject());
    if (model.val && !model.value) {
      // upgrade depricated format: 'val' is now 'value'
      model.value = model.val;
      delete model.val;
    }
    if (ecma.util.defined(this.original)) {
      model.value = this.original; // overrides default value
    }
    return model;
  };

  _proto.isHidden = function () {
    return this.model.type == 'hidden';
  };

  _proto.getName = function () {
    return this.name;
  };

  _proto.getValue = function () {
    return this.adaptor
      ? this.adaptor.serialize()
      : this.uiControl
        ? ecma.dom.getValue(this.uiControl)
        : undefined;
  };

  _proto.hasChanged = function () {
    var value = this.getValue();
    return this.model.type == 'password' && value == '*****' ? false :
      value == '' && !ecma.util.defined(this.original) ? false :
      value != this.original;
  };

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.getLabelElement = function () {
    return this.uiLabel || this.createLabel();
  };

  _proto.getControlElement = function () {
    return this.uiControl || this.createControl();
  };

  _proto.createUI = function () {
    var tr = ecma.dom.createElement('tr', [
      'th', [this.getLabelElement()],
      'td', [this.getControlElement()]
    ]);
    return this.uiRoot = tr;
  };

  _proto.createLabel = function () {
    var label = ecma.dom.createElement('label', {'for': this.id}, [
      '#text', {'nodeValue':this.model.label}
    ]);
    return this.uiLabel = label;
  };

  _proto.createControl = function () {
    var model = this.model;
    var tag = '';
    var adaptor = undefined;
    var attrs = {'id': this.id, 'class': model.type, 'name': this.name};
    var cnodes = [];
    var initialValue = model.value;
    switch (model.type) {
      case 'text':
        adaptor = ecma.lsn.forms.InputText;
        var maxLength = ecma.util.defined(model.maxlength)
          ? model.maxlength
          : 64;
        tag = 'input';
        attrs.type = 'text';
        attrs.maxlength = maxLength;
        break;
      case 'textarea':
        adaptor = ecma.lsn.forms.InputTextarea;
        tag = 'textarea';
        break;
      case 'password':
        adaptor = ecma.lsn.forms.InputText;
        tag = 'input';
        initialValue = model.value ? '*****' : '';
        attrs.type = 'password';
        break;
      case 'date':
        adaptor = ecma.lsn.forms.InputDate;
        tag = 'input';
        attrs.type = 'text';
        break;
      case 'hidden':
        tag = 'input';
        attrs.type = 'hidden';
        break;
      case 'select':
        tag = 'select';
        if (model.options) {
          for (var i = 0, opt; opt = model.options[i]; i++) {
            var opt_attrs = typeof(opt) === 'string'
              ? {'value': opt, 'innerHTML': opt}
              : {'value': opt.value, 'innerHTML': opt.text};
            if (opt.value == model.value) opt_attrs.selected = 'selected';
            cnodes.push('option', opt_attrs);
          }
        }
        break;
      case 'decimal':
        adaptor = ecma.lsn.forms.InputDecimal;
        tag = 'input';
        attrs.type = 'text';
        break;
      case 'checkbox':
      case 'radio':
      case 'file':
      case 'time':
      case 'datetime':
      case 'integer':
      case 'currency':
      default:
        throw new Error('Not a known form input control type: ' + model.type);
    }
    this.uiControl = ecma.dom.createElement(tag, attrs, cnodes);
    if (adaptor) {
      this.adaptor = new adaptor(this.uiControl);
      this.adaptor.sync();
    }
    if (initialValue) {
      if (this.adaptor) {
        this.adaptor.deserialize(initialValue);
      } else {
        ecma.dom.setValue(this.uiControl, initialValue);
      }
    }
    return this.uiControl;
  }

});
