/** @namespace dom */
ECMAScript.Extend('dom', function (ecma) {

  /**
   * References:
   *  http://unixpapa.com/js/key.html
   */

  var _lowerNames = [];
  _lowerNames[8] = 'backspace';
  _lowerNames[9] = 'tab';
  _lowerNames[13] = 'enter';
  _lowerNames[16] = 'shift';
  _lowerNames[17] = 'ctrl';
  _lowerNames[18] = 'alt';
  _lowerNames[19] = 'pause';
  _lowerNames[20] = 'capslock';
  _lowerNames[27] = 'esc';
  _lowerNames[144] = 'numlock';
  _lowerNames[145] = 'scrlock';

  var _modifierNames = [];
  _modifierNames[16] = 'shift';
  _modifierNames[17] = 'ctrl';
  _modifierNames[18] = 'alt';
  _modifierNames[20] = 'capslock';
  _modifierNames[144] = 'numlock';
  _modifierNames[145] = 'scrlock';

  var _commandNames = [];
  _commandNames[33] = 'pageup';
  _commandNames[34] = 'pagedown';
  _commandNames[35] = 'end';
  _commandNames[36] = 'home';
  _commandNames[37] = 'left';
  _commandNames[38] = 'up';
  _commandNames[39] = 'right';
  _commandNames[40] = 'down';
  _commandNames[45] = 'insert';
  _commandNames[46] = 'delete';

  var _functionNames = [];
  _functionNames[112] = 'f1';
  _functionNames[113] = 'f2';
  _functionNames[114] = 'f3';
  _functionNames[115] = 'f4';
  _functionNames[116] = 'f5';
  _functionNames[117] = 'f6';
  _functionNames[118] = 'f7';
  _functionNames[119] = 'f8';
  _functionNames[120] = 'f9';
  _functionNames[121] = 'f10';
  _functionNames[122] = 'f11';
  _functionNames[123] = 'f12';

  var _symbolNames = [];
  if (ecma.dom.browser.isIE || ecma.dom.browser.isWebKit) {
    _symbolNames[186] = ';';
    _symbolNames[187] = '=';
    _symbolNames[189] = '-';
  }
  if (ecma.dom.browser.isGecko || ecma.dom.browser.isOpera) {
    _symbolNames[109] = '-';
  }
  _symbolNames[188] = ',';
  _symbolNames[190] = '.';
  _symbolNames[191] = '/';
  _symbolNames[192] = '`';
  _symbolNames[219] = '[';
  _symbolNames[220] = '\\';
  _symbolNames[221] = ']';
  _symbolNames[222] = '\'';

  var CAction = ecma.action.ActionDispatcher;

  /**
   * @class KeyPress
   */

  this.KeyPress = function () {
    CAction.apply(this);
    this.handlers = {};
    this.events = [];
    this.queue = [];
    return this;
  };

  var KeyPress = this.KeyPress.prototype = ecma.lang.createPrototype(
    CAction
  );

  KeyPress.setHandler =
  KeyPress.addHandler = function () {
    var args = ecma.util.args(arguments);
    var name = args.shift();
    var cbList = this.handlers[name];
    if (!cbList) cbList = this.handlers[name] = [];
    cbList.push(args);
  };

  KeyPress.getHandlers = function (seq) {
    return this.handlers[seq.ascii];
  };

  KeyPress.attach = function (elem) {
    this.events = this.events.concat([
      new ecma.dom.EventListener(elem, 'keydown', this.onKeyDown, this),
      new ecma.dom.EventListener(elem, 'keypress', this.onKeyPress, this),
      new ecma.dom.EventListener(elem, 'keyup', this.onKeyUp, this)
    ]);
    return this;
  };

  KeyPress.detach = function (elem) {
    elem = ecma.dom.getElement(elem);
    for (var i = 0, evt; evt = this.events[i]; i++) {
      if (evt.target !== elem) continue;
      evt.remove();
      this.events.splice(i--, 1);
    }
    return this;
  };

  KeyPress.pumpEvent = function (event, chrSeq) {
    var cmdSeq = this.queue.shift();
    if (!cmdSeq) return; // An event must be registered (onkeydown)
    var seq = chrSeq && chrSeq.isCharacter ? chrSeq : cmdSeq;
    this.doEvent(event, seq);
  };

  KeyPress.doEvent = function (event, seq) {
    ecma.lang.assert(seq);
    if (seq.isModifier && !seq.downUp) return;
    ////this.trace(seq);
    // Handlers, which may stop the event and do not get called if the event 
    // has been stopped.
    var cbList = this.getHandlers(seq);
    if (cbList) {
      event.seq = seq;
      ecma.util.step(cbList, function (cb, event) {
        if (!event || event.stopped) return;
        ecma.lang.callback(cb, null, [event]);
      }, this, [event]);
    }
    this.dispatchAction('keypress', seq, event);
    this.lastSeq = seq; // hold for potential repeatEvent
  };

  KeyPress.repeatEvent = function (event) {
    ////ecma.console.log('repeat-event');
    if (this.lastSeq) this.doEvent(event, this.lastSeq);
  };

  KeyPress.onKeyDown = function (event) {
    this.state = 1;
    this.pumpEvent(event);
    var seq = this.getCommandSequence(event);
    ////this.trace(seq);
    if (seq.isResolved && !seq.isModifier) {
      // tab and shift+tab must be invoked now as chrome/safari/ie won't
      // ever supply a corresponding press|up event when the control
      // loses focus.
      //
      // webkit invokes the default action on keydown (like enter, arrows,
      // ctrl+b, etc).
      this.doEvent(event, seq);
    } else {
      // Add to the event queue, will be executed on keypress/keyup
      this.queue.push(seq);
    }
  };

  KeyPress.onKeyPress = function (event) {
    if (this.state == 2) {
      // Repeat on FF under Linux.  FF under Win32 will issue a keydown
      // event for repeats.
      this.repeatEvent();
      return;
    }
    this.state = 2;
    var seq = this.getCharacterSequence(event);
    this.pumpEvent(event, seq);
  };

  KeyPress.onKeyUp = function (event) {
    if (this.state == 1) {
      // signal this is a down-up scenario (no press)
      var seq = this.queue[0];
      if (seq) seq.downUp = true;
    }
    this.state = 3;
    this.pumpEvent(event);
  };

  KeyPress.getCommandSequence = function (event) {
    ////ecma.console.log('w=', event.which, 'kc=', event.keyCode);
    var num = event.keyCode;
    var name = undefined;
    var isModifier = false;
    var isResolved = event.ctrlKey || event.altKey || event.metaKey
      ? true : false;
    if (num < 32 || num in _lowerNames) {
      name = _lowerNames[num];
      isModifier = _modifierNames[num] ? true : false;
      isResolved = true;
    } else {
      if (num in _commandNames) {
        name = _commandNames[num];
        isResolved = true;
      } else {
        if (num in _symbolNames) {
          name = _symbolNames[num];
          // shift+' should not be resolved
          isResolved = event.shiftKey ? false : true;
        } else if (num in _functionNames) {
          name = _functionNames[num];
          isResolved = true;
        } else {
          name = String.fromCharCode(num).toLowerCase();
        }
      }
    }
    var ascii = [];
    if (ecma.util.defined(name)) {
      if (event.ctrlKey && name != 'ctrl') ascii.push('ctrl');
      if (event.altKey && name != 'alt') ascii.push('alt');
      if (event.shiftKey && name != 'shift') ascii.push('shift');
      if (event.metaKey && name != 'meta') ascii.push('meta');
      ascii.push(name);
    }
    var seq = {
      'ascii':    ascii.join('+'),
      'numeric':  num,
      'isModifier': isModifier,
      'isResolved': isResolved,
      'isCharacter': false,
      'keyCode':  event.keyCode,
      'which':    event.which,
      'type':     event.type
    };
    ////this.trace(seq, 'cmd');
    return seq;
  };

  KeyPress.getCharacterSequence = function (event) {
    var num = ecma.util.defined(event.which) ? event.which : event.keyCode;
    var isModifier = false;
    var omitShift = false;
    var name = undefined;
    if (num < 32 || num in _lowerNames) {
      name = _lowerNames[num];
      isModifier = _modifierNames[num] ? true : false;
    } else {
      name = String.fromCharCode(num);
      omitShift = true;
    }
    var isCharacter = name && !event.ctrlKey && !event.altKey;
    var ascii = [];
    if (ecma.util.defined(name)) {
      if (event.ctrlKey && name != 'ctrl') ascii.push('ctrl');
      if (event.altKey && name != 'alt') ascii.push('alt');
      if (event.shiftKey && name != 'shift' && !omitShift) ascii.push('shift');
      if (event.metaKey && name != 'meta') ascii.push('meta');
      ascii.push(name);
    }
    var seq = {
      'ascii':    ascii.join('+'),
      'numeric':  num,
      'isModifier': isModifier,
      'isResolved': true,
      'isCharacter': isCharacter,
      'keyCode':  event.keyCode,
      'which':    event.which,
      'type':     event.type
    };
    ////this.trace(seq, 'chr');
    return seq;
  };

  KeyPress.trace = function () {
    var out = ecma.util.args(arguments);
    var seq = out.shift();
    var flags = '';
    if (seq.isCharacter) flags += 'c';
    if (seq.isModifier) flags += 'm';
    if (seq.isResolved) flags += 'r';
    out.push(ecma.util.pad(seq.type, 10, ' '));
    out.push(ecma.util.pad(seq.keyCode, 5, ' '));
    out.push(ecma.util.pad(seq.which, 5, ' '));
    out.push(ecma.util.pad(seq.numeric, 5, ' '));
    out.push(ecma.util.pad(flags, 6, ' '));
    out.push(ecma.util.pad(seq.ascii, 25, ' '));
    ecma.console.log(out.join('|'));
  };

  KeyPress.traceHeader = function () {
    var out = [];
    out.push(ecma.util.pad('event', 10, ' '));
    out.push(ecma.util.pad('keyCo', 5, ' '));
    out.push(ecma.util.pad('which', 5, ' '));
    out.push(ecma.util.pad('using', 5, ' '));
    out.push(ecma.util.pad('flags', 6, ' '));
    out.push(ecma.util.pad('sequence', 25, ' '));
    ecma.console.log(out.join('|'));
  };

});
