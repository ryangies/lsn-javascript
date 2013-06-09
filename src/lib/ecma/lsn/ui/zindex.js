/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  var _zIndex = 102;
  var _zCount = 0;

  /**
   * @function zIndex
   */

  this.zIndex = function () {
    return _zIndex + (2 * _zCount);
  }

  /**
   * @function zIndexAlloc
   */

  this.zIndexAlloc = function () {
    _zCount++;
    return ecma.lsn.zIndex();
  }

  /**
   * @function zIndexFree
   */

  this.zIndexFree = function () {
    _zCount--;
    return ecma.lsn.zIndex();
  };

});
