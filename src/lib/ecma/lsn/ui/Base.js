/** @namespace lsn.ui */
ECMAScript.Extend('lsn.ui', function (ecma) {

  var CAction = ecma.action.ActionDispatcher;

  /**
   * @class Base
   */

  this.Base = function () {

    CAction.apply(this);
    this.zIndex = ecma.lsn.zIndex();

  };

  var _proto = this.Base.prototype = ecma.lang.createPrototype(
    CAction
  );

  /**
   * @function zIndexAlloc
   */

  _proto.zIndexAlloc = function () {
    return this.zIndex = ecma.lsn.zIndexAlloc();
  };

  /**
   * @function zIndexFree
   */

  _proto.zIndexFree = function () {
    return this.zIndex = ecma.lsn.zIndexFree();
  };

});
