/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  /**
   * @class PageLayout
   * Wrapper class for window events.
   *
   *  new PageLayout();
   *  new PageLayout(opts);
   *
   *  opts.load     Window onLoad event callback
   *  opts.resize   Window onResize event callback
   *  opts.unload   Window onUnload event callback
   *
   * The default load function calls resize so you don't have to.  This class
   * is intended to be used simply as:
   * 
   *  new PageLayout({resize: function (event) {
   *
   *    // resize page elements
   *
   *  });
   */

  this.PageLayout = function (opts) {
    ecma.util.overlay(this, opts);
    ecma.dom.addEventListener(ecma.window, 'load', this.load, this);
    ecma.dom.addEventListener(ecma.window, 'resize', this.resize, this);
    ecma.dom.addEventListener(ecma.window, 'unload', this.unload, this);
  };

  this.PageLayout.prototype = {

    /** @internal load */
    load: function (event) {
      this.resize(event);
    },

    /** @internal resize */
    resize: function (event) {
    },

    /** @internal unload */
    unload: function (event) {
    }

  };

});
