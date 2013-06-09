/** @namespace data.utf8 */
ECMAScript.Extend('data.utf8', function (ecma) {

  /**
   * @function encode
   */

  this.encode = function (str) {
    if (typeof(str) != 'string') {
      str = new String(str);
    }
    str = str.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  };

  /**
   * @function decode
   */

  this.decode = function (utftext) {
    var str = "";
    var i = 0;
    var c = c2 = c3 = 0;
    while ( i < utftext.length ) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        str += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return str;
  };

});
