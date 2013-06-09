/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * @class LocationListener
   * Watches the document location href and dispatches a change event.
   *
   *  var ll = new ecma.dom.LocationListener();  // starts polling immediately
   *
   *  ll.addActionListener('change', func);
   *  ll.addActionListener('change', func, scope);
   *  ll.addActionListener('change', func, scope, args);
   *
   * The check interval is 75ms.
   *
   * This class allows one to be notified when the document location changes.
   * Implemented because there is no C<onLocationChange> event.  Enables a
   * callback when only the C<hash> portion of the location is changing.
   */

  var CActionDispatcher = ecma.action.ActionDispatcher;
  var proto = ecma.lang.createPrototype(CActionDispatcher);

  this.LocationListener = function () {
    CActionDispatcher.apply(this);
    this.checkInterval = 75;
    this.setLocation();
    this.intervalId = ecma.dom.setInterval(this.checkLocation, 
      this.checkInterval, this);
  };

  this.LocationListener.prototype = proto;

  proto.setLocation = function () {
    this.currentHref = ecma.document.location.href;
    this.currentLocation = new ecma.http.Location();
  };

  proto.checkLocation = function () {
    var href = ecma.document.location.href;
    if (this.currentHref != href) {
      var prevLocation = this.currentLocation;
      this.setLocation();
      this.dispatchAction('change', this.currentLocation, prevLocation);
    }
  };

  proto.destroy = function () {
    ecma.dom.clearInterval(this.intervalId);
  };

});
