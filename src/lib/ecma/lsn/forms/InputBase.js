/** @namespace lsn.forms */
ECMAScript.Extend('lsn.forms', function (ecma) {

  /**
   *
   *        .------------------------------------------------------------------ serialized notation
   *        |
   *        |                .------------------------------------------------- javascript object
   *        |                |
   *        |                |                   .----------------------------- ui string notation
   *        |                |                   |
   *        |                |                   |                    .-------- user input
   *        |                |                   |                    |
   *  [data string] <---> [object] <---> [control string] <---> [input element]
   *                  |              |                      |
   *                  |              |                      '------------------ read/write
   *                  |              |
   *                  |              '----------------------------------------- unmarshal/marshal
   *                  |
   *                  '-------------------------------------------------------- serialize/deserialize
   *
   * For example:
   *
   *  [3.14E0] <---> [Number] <---> [3.14] <---> [input element]
   *
   *    * When the user enters "abc", which is not a number, the control string
   *      should become "0.00" and the input element updated.  The internal
   *      value (which is a Number) is set to zero.
   *
   * The input control interracts with JavaScript using:
   *
   *    * getValue, which returns the internal value object
   *
   *    * setValue, which takes an object of the same type as the internal
   *      value object
   *
   *    * serialize, which returns a storable data string
   *
   *    * deserialize, which takes a String as would be returned by serialize.
   *
   * The input control interracts with the user using:
   *
   *    * read, which reads the value from the element and sets the internal 
   *      value object accordingly.
   *
   *    * write, which sets the value of the element from the internal value
   *      object.
   *
   *    * sync, which responds to an onChange event, reading the new value and
   *      then writing it back out.
   *
   */

  var CAction = ecma.action.ActionDispatcher;

  this.InputBase = function (elem) {
    CAction.apply(this);
    this.elem = null;
    this.value = this.emptyValue = null;
    this.evtChange = null;
    if (elem) this.attach(elem);
  };

  var InputBase = this.InputBase.prototype = ecma.lang.createPrototype(CAction);
  
  InputBase.attach = function (elem) {
    elem = ecma.dom.getElement(elem);
    if (!elem) throw new Error('Missing input element');
    this.elem = elem;
    this.evtChange = new ecma.dom.EventListener(
      this.elem, 'change', function(event){
        this.sync();
        this.dispatchAction('change', this);
      }, this
    );
  };

  InputBase.detach = function () {
    if (this.evtChange) this.evtChange.remove();
  };

  InputBase.reset = function () {
    return this.setValue(this.emptyValue);
  };

  InputBase.getValue = function () {
    this.read();
    return this.value;
  };

  InputBase.setValue = function (value) {
    this.value = value;
    this.write();
    return this;
  };

  InputBase.sync = function () {
    this.read();
    this.write();
    return this;
  };

  InputBase.read = function () {
    this.value = this.unmarshal(ecma.dom.getValue(this.elem));
    return this;
  };

  InputBase.write = function () {
    ecma.dom.setValue(this.elem, this.marshal(this.value));
    return this;
  };

  InputBase.marshal = function (dataValue) {
    var ctrlValue = dataValue;
    return ctrlValue;
  };

  InputBase.unmarshal = function (ctrlValue) {
    var dataValue = ctrlValue;
    return dataValue;
  };

  InputBase.deserialize = function (storedValue) {
    this.setValue(storedValue);
    return this;
  };

  InputBase.serialize = function () {
    return this.getValue();
  };

});
