/** @namespace lsn.hubb.command */
ECMAScript.Extend('lsn.hubb.command', function (ecma) {

  function _dataType (name, node) {
    var type = null;
    if (ecma.util.isa(node, ecma.data.Container)) {
      type = node instanceof ecma.hubb.HashNode
        ? 'data-hash'
        : node instanceof ecma.hubb.ArrayNode
          ? 'data-array'
          : undefined;
    } else {
      type = 'data-scalar';
      var ext = ecma.data.addr_ext(name);
      if (ext) type += '-' + ext;
    }
    ecma.lang.assert(type != null);
    return type;
  }

  var CAction = ecma.action.ActionDispatcher;
  var CParameters = ecma.impl.Parameters;
  var CRequest = ecma.lsn.Request;

  /**
   * @class Base
   */

  this.Base = function CBase (verb) {
    CAction.apply(this);
    CParameters.apply(this);
    CRequest.apply(this, ['/api/hub/' + verb, {method:'POST'}]);
    this.verb = verb;
    this.cbList = [];
    this.argspec = [];
    this.result = undefined;
    this.setHeader('X-Auth-Token', ecma.lsn.auth.getAuthToken());
  };

  var Base = this.Base.prototype = ecma.lang.createPrototype(
    CAction, CParameters, CRequest
  );

  Base.setArguments = function () {
    var params = ecma.util.associateArrays(arguments, this.argspec);
    return this.overlayParameters(params);
  };

  Base.setHeaders = function (headers) {
    for (name in headers) {
      this.setHeader(name, headers[name]);
    }
    return this.headers;
  };

  Base.submit = function (cb) {
    this.result = undefined;
    if (cb) this.cbList.push(cb);
    var params = this.getParameters();
    //ecma.console.log('send');
    //ecma.console.dir(params);
    return CRequest.prototype.submit.call(this, params);
  };

  Base.getXFR = function (encoding) {
    return new ecma.hubb.XFR(encoding);
  };

  Base.callback = function () {
    try {
      var args = ecma.util.args(arguments);
      ecma.util.step(this.cbList, this.invokeCallback, this, args);
    } catch (ex) {
      // Errors reported by `step`
    } finally {
      this.cbList = [];
    }
  };

  Base.invokeCallback = function (cb) {
    var args = ecma.util.args(arguments);
    args.shift(); // cb
    ecma.lang.callback(cb, null, args);
  };

  Base.onSuccess = function () {
    //ecma.console.log('recv');
    //ecma.console.dir(this.responseHash.toObject());
    this.process(this.responseHash);
  };

  Base.validate = function (rh) {
    try {
      ecma.lang.assert(rh);
      var error = rh.getObject('/head/error');
      if (error) {
        if (error.type == 'Error::DoesNotExist'
            || error.type == 'Error::NotFound') {
          var addr = rh.getString('/head/meta/addr');
          if (addr) this.executeAction('remove', addr);
        }
        throw new Error('[Server Error]' + error.message);
      }
    } catch (ex) {
      ///ecma.console.log(ex);
      return false;
    }
    return true;
  };

  Base.onComplete = function () {
    this.dispatchAction('complete', this);
    this.callback(this.result);
  };

  /**
   * process - Process the response
   *
   * Note that this stage is called for subsets and batches, which is why you
   * see error handling done here.
   */

  Base.process = function (rh) {
    var responses;
    var type = rh.getString('/head/struct');
    if (type == 'branch') {
      if (!this.validate(rh)) {
        return;
      }
      responses = rh.get('body').values();
    } else {
      responses = [rh];
    }
    for (var i = 0, rh2; rh2 = responses[i]; i++) {
      if (this.validate(rh2)) {
        this.fixup(rh2);
      }
    }
  };

  Base.fixup = function (rh) {
    var meta = rh.get('/head/meta').toObject();
    var struct = rh.get('/body');
    ecma.lang.assert(struct);
    struct.attributes = meta;
    if (struct.isDirectory()) {
      struct.iterate(function (k, v) {
        var type = v.getString('type');
        if (!type) throw new Error('Malformed response hash');
        ecma.lang.assert(type && type.match(/^(directory|file)\b/));
        var stub = new ecma.hubb.HashNode();
        stub.attributes = v.toObject();
        stub.setAttribute('mtime', 0); // this is a stub, supress if-modified logic
        stub.setAttribute('mtime2', v.get('mtime')); // hold on to the mtime for display
        struct.setValue(k, stub);
      });
    } else if (struct.isDataContainer()) {
      var baseAddr = struct.getAddress();
      struct.walk(function (name, item, depth, addr) {
        item.attributes = {
          'addr': ecma.data.addr_join(baseAddr, addr),
          'type': _dataType(name, item)
//        ,
//        'mtime': meta.mtime
        };
      });
    }
    this.result = struct;
    this.executeAction('fixup', this.result);
  };

  Base.getResult = function () {
    return this.result;
  };

});
