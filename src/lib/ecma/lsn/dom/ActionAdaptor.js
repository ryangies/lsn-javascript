/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class ActionAdaptor
   */

  this.ActionAdaptor = function () {
    ecma.dom.ElementAdaptor.apply(this);
    this.keyword = 'action';
  };

  var _proto = this.ActionAdaptor.prototype = ecma.lang.createPrototype(
    ecma.dom.ElementAdaptor
  );

  /**
   * @function createListener
   */

  _proto.createListener = function (elem, spec) {
    var listener = null;
    var parts = spec.split(/:/);
    if (parts) {
      var type = parts.shift();
      var name = parts.shift();
      var arg1 = parts.join(':');
      if (type == this.keyword) {
        listener = new ecma.dom.EventListener(elem, 'click', function (/*...*/) {
          var args = ecma.util.args(arguments);
          var event = args.shift();
          var action = {
            'name': args.shift(),
            'event': event,
            'element': elem
          };
          ecma.dom.stopEvent(event);
          this.executeClassAction.apply(this, [action, elem].concat(args));
        }, this, [name, arg1]);
      }
    }
    return listener;
  };

});
