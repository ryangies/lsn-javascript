/** @namespace fx */
ECMAScript.Extend('fx', function (ecma) {

  var CActionDispatcher = ecma.action.ActionDispatcher;

  var proto = ecma.lang.createPrototype(CActionDispatcher);

  /**
   * @class Sequencer
   */

  this.Sequencer = function (interval, loop) {
    CActionDispatcher.apply(this);
    this.seqEvents = {}; // event handles
    this.seqItems = []; // the sequence
    this.seqInterval = interval; // milliseconds
    this.seqAutoAdvance = null; // 1=forward, -1=backward
    this.seqBlocking = false; // semiphore
    this.seqIndex = -1; // array index of current item
  };

  this.Sequencer.prototype = proto;

  proto.createActionEvent = function (name) {
    return new ecma.fx.SequencerEvent(name, this);
  };

  proto.isValid = function () {
    return this.seqItems.length > 0;
  };

  proto.isValidIndex = function (idx) {
    return 0 <= this.seqIndex && this.seqIndex < this.seqItems.length;
  };

  proto.setInterval = function (ms) {
    return this.seqInterval = ms;
  };

  proto.getInterval = function () {
    return ecma.util.defined(this.seqInterval) ? this.seqInterval : 0;
  };

  proto.getIndex = function () {
    return this.seqIndex;
  };

  proto.addItem = function (item) {
    return this.seqItems.push(item);
  };

  proto.getItem = function (idx) {
    return this.seqItems[idx];
  };

  proto.removeItem = function (item) {
    var idx = -1;
    for (var i = 0; i < this.seqItems.length; i++) {
      if (this.seqItems[i] === item) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      return this.seqItems.splice(idx, 1);
    }
  };

  proto.start = function () {
    this.executeAction('start');
    this.seqAutoAdvance = 1;
    return this.autoAdvance();
  };

  proto.prev = function () {
    if (this.seqAutoAdvance) {
      this.seqAutoAdvance = -1;
      return this.autoAdvance()
    } else {
      this.select(this.seqIndex - 1);
    }
  };

  proto.next = function () {
    if (this.seqAutoAdvance) {
      this.seqAutoAdvance = 1;
      return this.autoAdvance()
    } else {
      this.select(this.seqIndex + 1);
    }
  };

  proto.autoAdvance = function () {
    this.select(this.seqIndex + this.seqAutoAdvance);
    return this;
  };

  proto.select = function (idx) {
    if (!this.isValid() || this.seqBlocking) return;
    if (this.seqIndex == idx) return;
    ecma.dom.clearTimeout(this.seqEvents.tid);
    // Loop if necessary
    if (idx + 0 != idx) {
      throw new Error('Invalid index');
    }
    try {
      // Deselect current
      this.seqBlocking = true;
      if (this.isValidIndex(this.seqIndex)) {
        this.executeAction('deselect', this.getItem(this.seqIndex), this.seqIndex);
      }
    } finally {
      this.seqBlocking = false;
    }
    if (idx < 0) {
      return this.loop(this.seqItems.length - 1);
    } else if (idx >= this.seqItems.length) {
      return this.loop(0);
    }
    try {
      // Select
      this.seqBlocking = true;
      this.seqIndex = idx;
      this.executeAction('select', this.getItem(this.seqIndex), this.seqIndex);
    } finally {
      this.seqBlocking = false;
    }
    if (this.seqAutoAdvance) {
      this.seqEvents.tid = ecma.dom.setTimeout(this.autoAdvance, this.getInterval(), this);
    }
    return this;
  }

  proto.loop = function (idx) {
    this.select(idx);
  };

  proto.stop = function () {
    this.seqAutoAdvance = null;
    this.dispatchAction('stop');
    return this;
  };

});
