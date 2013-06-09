/** @namespace impl */
ECMAScript.Extend('impl', function (ecma) {

  /** @class Parameters
   */

  this.Parameters = function CParameters (initialParameters) {
    this.parameters = initialParameters
      ? js.util.clone(initialParameters)
      : new Object();
  };

  var Parameters = this.Parameters.prototype = ecma.lang.createPrototype();

  /**
   * @function getParameter
   * Return a single parameter value.
   */

  Parameters.getParameter = function (key) {
    return this.parameters[key];
  };

  /**
   * @function setParameter
   * Set a single parameter value.
   */

  Parameters.setParameter = function (key, value) {
    return this.parameters[key] = value;
  };

  /**
   * @function getParameters
   * Return the underlying object.
   */

  Parameters.getParameters = function () {
    return this.parameters;
  };

  /**
   * @function setParameters
   * Set the underlying object.
   */

  Parameters.setParameters = function (parameters) {
    return this.parameters = js.util.clone(parameters);
  };

  /**
   * @function overlayParameters
   * Overlay the provided parameters on to the underlying object.
   */

  Parameters.overlayParameters = function (parameters) {
    ecma.util.overlay(this.parameters, parameters);
    return this.parameters;
  };

});
