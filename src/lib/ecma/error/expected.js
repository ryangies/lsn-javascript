/** @namespace error.expected */
ECMAScript.Extend('error.expected', function (ecma) {

{#:for (type) in types}
  this.{#type} = function () { this.message = "{#type} expected." };
  this.{#type}.prototype = new TypeError();

{#:end for}
});
__DATA__
types => @{
  Array
  AssociativeArray
  Callback
  Function
  Object
  String
}
