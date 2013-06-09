/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  /**
   * @class Form
   * Create an HTML form according to the provided definition.
   *
   *  var form = new ecma.lsn.forms.Form(def, vals);
   *  var formElem = form.getRootElement();
   *  // Append formElem to where the form should appear
   *
   * @param def <ecma.data.HashList> Form defintion L<1>
   * @param vals <ecma.data.HashList> Optional form values (name:value pairs)
   *
   * N<1> Form defintion format
   *
   *  action => /where/to/post              Optional, L<2>
   *  submit => Submit                      Optional, L<3>
   *  fieldsets => @{
   *    %{
   *      heading => Heading                Optional
   *      fields => %{
   *        name => %{                      L<4>
   *          label => Label                Optional
   *          type => type                  L<5>
   *          value => default-value
   *          max-length => number          for type=text
   *        }
   *      }
   *    }
   *  }
   *
   * N<2> Form action
   *
   * If no form action is provided, this class will dispatch a C<doSubmit>
   * action.
   *
   * N<3> Submit-button text
   *
   * If no submit-button text is provided, no submit button will be created.
   *
   * N<4> Field C<name>s
   *
   * The field C<name> is the datum key used when creating a hash list of form
   * values.  Meaning that if you have several fields, with these ids:
   *
   *  billingAddress/line1
   *  billingAddress/line2
   *  shippingAddress/line1
   *  shippingAddress/line2
   *  some/other/thing
   *  other/stuff
   *  other/stuff
   *  other/stuff
   *
   * Then the paramaters are submitted as the structured object:
   *
   *  billingAddress => %{
   *    line1 => its-value
   *    line2 => its-value
   *  }
   *  shippingAddress => %{
   *    line1 => its-value
   *    line2 => its-value
   *  }
   *  some => %{
   *    other => %{
   *      thing => its-value
   *    }
   *  }
   *  other => %{
   *    stuff => @{
   *      first-value
   *      second-value
   *      third-value
   *    }
   *  }
   *    
   *
   * N<5> Field types
   *
   *  hidden        INPUT TYPE="hidden"
   *  text          INPUT TYPE="text"
   *  textarea      TEXTAREA
   *  date          INPUT TYPE="text"
   *  password      INPUT TYPE="password"
   *  
   */

  var CDispatcher = ecma.action.ActionDispatcher;

  this.Form = function (def, vals) {
    CDispatcher.call(this);
    this.model = this.mapFormDefinition(def, vals);
  };

  var _proto = this.Form.prototype = ecma.lang.createPrototype(CDispatcher);

  _proto.mapFormDefinition = function (def, vals) {
    var model = {
      'action': def.getValue('action'),
      'submit': def.getValue('submit'),
      'fieldsets': []
    };
    def.getValue('fieldsets').iterate(function (i, fs) {
      model.fieldsets.push(new ecma.lsn.forms.Fieldset(fs, vals));
    }, this);
    return model;
  };

  _proto.getRootElement = function () {
    return this.uiRoot || this.createUI();
  };

  _proto.focus = function () {
    if (!this.uiFirstVisibleControl) return;
    this.uiFirstVisibleControl.focus();
  };

  _proto.disableForm = function () {
  };

  _proto.enableForm = function () {
  };

  _proto.resetForm = function () {
  };

  _proto.submitForm = function () {
    var values = this.getValues();
    this.doSubmitValues(values);
  };

  _proto.submitFormChanges = function () {
    if (!this.hasChanged()) return false;
    var values = this.getChangedValues();
    this.doSubmitValues(values);
    return true;
  };

  _proto.createUI = function () {
    var tbody = ecma.dom.createElement('tbody');
    var form = ecma.dom.createElement('form', {
      'method': 'POST',
      'autocomplete': 'off',
      'onSubmit': [this.onFormSubmitEvent, this]
    }, [
      'table', [tbody]
    ]);
    if (this.model.submit) {
      form.appendChild(ecma.dom.createElement('div',
        {'class': 'buttons'}, [
        'input', {
          'type': 'submit',
          'name': 'submit',
          'value': this.model.submit
        }
      ]));
    }
    delete this.uiFirstVisibleControl;
    for (var i = 0, fs; fs = this.model.fieldsets[i]; i++) {
      if (fs.heading) {
        tbody.appendChild(ecma.dom.createElement(
          'tr', ['th', {'colspan':2}, ['h4', ['#text', {'nodeValue': fs.heading}]]]
        ));
      }
      for (var j = 0, field; field = fs.fields[j]; j++) {
        if (field.isHidden()) {
          form.appendChild(field.getControlElement());
        } else {
          tbody.appendChild(field.getRootElement());
          if (!this.uiFirstVisibleControl) {
            this.uiFirstVisibleControl = field.getControlElement();
          }
        }
      }
    }
    return this.uiRoot = form;
  };

  _proto.onFormSubmitEvent = function (event) {
    ecma.dom.stopEvent(event);
    this.submitForm();
  };

  _proto.getFields = function () {
    var fields = [];
    var fieldsets = this.model.fieldsets;
    for (var i = 0, fs; fs = fieldsets[i]; i++) {
      for (var j = 0, field; field = fs.fields[j]; j++) {
        fields.push(field);
      }
    }
    return fields;
  };

  _proto.getValues = function () {
    var values = {};
    var fields = this.getFields();
    for (var j = 0, field; field = fields[j]; j++) {
      values[field.getName()] = field.getValue();
    }
    return values;
  };

  _proto.getChangedValues = function () {
    var values = {};
    var fields = this.getFields();
    for (var j = 0, field; field = fields[j]; j++) {
      if (field.hasChanged()) values[field.getName()] = field.getValue();
    }
    return values;
  };

  _proto.hasChanged = function () {
    var values = this.getChangedValues();
    for (var k in values) { return true; }
    return false;
  };

  _proto.doSubmitValues = function (values) {
    var params = new ecma.data.HashList();
    for (var k in values) {
      params.set(k, values[k]);
    }
    if (this.model.action) {
      var req = new ecma.lsn.Request(this.model.action);
      req.addEventListener('onComplete', this.doSubmitComplete, this);
      req.submit(params);
      this.dispatchClassAction('onSubmit', req);
    } else {
      this.dispatchClassAction('doSubmit', params);
    }
  };

  _proto.doSubmitComplete = function (req) {
    var rc = req.xhr.status;
    if (rc == 200) {
      var data = req && req.responseHash
        ? req.responseHash.get('body')
        : undefined;
      this.dispatchClassAction('onSubmitOk', data);
    } else {
      var ex = new Error(rc + ': ' + req.xhr.responseText);
      this.dispatchClassAction('onSubmitNotOk', ex, req);
    }
    this.dispatchClassAction('onSubmitComplete', req);
  };

});
