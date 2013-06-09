/** @namespace lsn */
ECMAScript.Extend('lsn', function (ecma) {

  /**
   * @class ComboBox
   * Base class for extending an INPUT control with a drop-down list.
   *
   *  // Create a class MyClass which extends ecma.lsn.ComboBox
   *
   *  var cbox = new MyClass();
   *  cbox.attach('ctrl1'); // where ctrl1 is the ID of an input control
   *  
   * Later on, you may want to call:
   *
   *  cbox.show(); // manually open the drop-down
   *  cbox.hide(); // manually close the drop-down
   */

  this.ComboBox = function () {
    this.ctrl = ecma.dom.createElement('input');
    this.toggle = ecma.dom.createElement('img', {
      'alt': '[...]',
      'src': '/res/images/dropdown.png',
      'onClick': [this.onToggle, this],
      'style': {
        'font-size':'8pt',
        'width':'16px',
        'height':'16px',
        'cursor':'pointer',
        'vertical-align':'text-bottom'
      }
    });
    if (!this.ui) this.ui = {box:null};
    this.mask = new ecma.lsn.Mask();
    this.vUnmask = new ecma.dom.EventListener(
      this.mask.getElement(), 'click', this.hide, this);
  };

  var proto = this.ComboBox.prototype = {};

  proto.destroy = function () {
    this.vUnmask.remove();
  };

  /**
   * @function attach
   * Attach to an input control.
   *  cbox.attach('ctrl1');
   * This will append an IMG element to the dom which functions as the drop-
   * down button for the control.
   */

  proto.attach = function (elem) {
    var ctrl = ecma.dom.getElement(elem);
    ecma.dom.insertAfter(this.toggle, ctrl);
    ecma.dom.addClassName(ctrl, 'combo');
    this.ctrl = ctrl;
  };

  proto.setPosition = function () {
    var box = this.getElement();
    ecma.dom.setStyle(box, 'top', ecma.dom.getBottom(this.ctrl) + 'px');
    ecma.dom.setStyle(box, 'left', ecma.dom.getLeft(this.ctrl) + 'px');
    ecma.dom.setStyle(box, 'width', (ecma.dom.getWidth(this.ctrl)) + 'px');
  };

  /**
   * @function show
   * Show the drop-down.
   *  cbox.show();
   */

  proto.show = function () {
    this.setPosition();
    var zIndex = ecma.lsn.zIndexAlloc();
    ecma.dom.setStyle(this.ui.box, 'z-index', zIndex);
    ecma.dom.setAttribute(this.ctrl, 'disabled', 'disabled');
    this.mask.show({
      'opacity':0,
      'z-index':zIndex - 1
    });
    ecma.dom.setStyle(this.ui.box, 'visibility', 'visible');
    ecma.dom.getBody().appendChild(this.ui.box);
    var boxBottom = ecma.dom.getBottom(this.ui.box);
    var vpHeight = ecma.dom.getViewportPosition().height;
    if (boxBottom > vpHeight) {
      this.ui.tmpBottomMargin = ecma.dom.createElement('div', {
        'style': {
          'position': 'relative',
          'height': ((boxBottom - vpHeight) + 50) + 'px'
        }
      });
      ecma.dom.getBody().appendChild(this.ui.tmpBottomMargin);
    }
    this.isVisible = true;
  };

  /**
   * @function hide
   * Hide the drop-down.
   *  cbox.hide();
   */

  proto.hide = function () {
    ecma.dom.removeAttribute(this.ctrl, 'disabled', 'disabled');
    ecma.dom.setStyle(this.ui.box, 'visibility', 'hidden');
    ecma.dom.removeElement(this.ui.box);
    ecma.lsn.zIndexFree();
    this.mask.hide();
    this.isVisible = false;
    if (this.ui.tmpBottomMargin) {
      ecma.dom.removeElement(this.ui.tmpBottomMargin);
      this.ui.tmpBottomMargin = null;
    }
  };

  proto.onToggle = function (event) {
    ecma.dom.stopEvent(event);
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  };

  proto.getElement = ecma.lang.createAbstractFunction();

});
