/** @namespace impl */
ECMAScript.Extend('impl', function (ecma) {

  /** @class Options
   */

  this.Options = function COptions (initialOptions) {
    this.options = this.options
      ? this.overlayOptions(initialOptions) // Multiple inhertance
      : js.util.clone(initialOptions);
  };

  var _proto = this.Options.prototype = ecma.lang.createPrototype();

  /**
   * @function getOption
   * Return a single option value.
   */

  _proto.getOption = function (key) {
    return this.options[key];
  };

  /**
   * @function setOption
   * Set a single option value.
   */

  _proto.setOption = function (key, value) {
    if (key in this.options) {
      return this.options[key] = value;
    } else {
      throw new Error('Not an option:' + key);
    }
  };

  /**
   * @function getOptions
   * Return the underlying object.
   */

  _proto.getOptions = function () {
    return this.options;
  };

  /**
   * @function setOptions
   * Set the underlying object.
   */

  _proto.setOptions = function (options) {
    return this.options = js.util.clone(options);
  };

  /**
   * @function overlayOptions
   * Overlay the provided options on to the underlying object.
   */

  _proto.overlayOptions = function (options) {
    ecma.util.overlay(this.options, options);
    return this.options;
  };

});
