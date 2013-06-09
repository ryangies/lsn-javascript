/** @namespace hubb.ui */
ECMAScript.Extend('hubb.ui', function (ecma) {

  this.createInput = function (node) {
    var type = node.getType();
    var obj = undefined;
//  js.console.log('Create an input control, type=' + type);
    switch (type) {
      case 'data-scalar-bool':
        obj = new ecma.hubb.ui.input.InputBoolean(node);
        break;
      case 'data-scalar-txt':
        obj = new ecma.hubb.ui.input.InputTextarea(node);
        break;
      default:
        obj = new ecma.hubb.ui.input.InputText(node);
    }
    return obj;
  };

});
