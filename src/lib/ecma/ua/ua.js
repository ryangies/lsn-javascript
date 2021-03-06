/** @namespace us */
ECMAScript.Extend('ua', function (ecma) {

  var _userAgent = undefined;
  var _appVersion = undefined;

  try {
    _userAgent = ecma.window.navigator.userAgent;
    _appVersion = ecma.window.navigator.appVersion;
  } catch (ex) {
  }
/*
  this.isGecko = false;
  this.isChrome = false;

  this.isIE = false;
  this.isIE = false;
  this.isIE = false;

  var _browsers = null;
  var _platforms = null;
  var _info = null;
  var _pkg = this;

  this.getInfo = function () {
    return _info;
  };

  this.Info = function () {
		this.browser = this.searchString(_browsers) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.os = this.searchString(_platforms) || "an unknown OS";
	},

  this.Info.prototype = proto = {};

	proto.searchString = function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	};

	proto.searchVersion = function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	};

	_browsers = [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	
      string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		
      // for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	];

	_platforms = [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	];

  _info = new _pkg.Info();
  this.isIE = _info.browser == 'Explorer';
  this.isIE8 = _info.browser == 'Explorer' && _info.version == 8;
*/
});
