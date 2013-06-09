/**
 * @namespace dom.constants
 * Constant values.
 * See also: L<http://www.w3.org/TR/DOM-Level-3-Core/core.html>
 */

ECMAScript.Extend('dom.constants', function (ecma) {

  /**
   * @member ELEMENT_NODE
   * @member ATTRIBUTE_NODE
   * @member TEXT_NODE
   * @member CDATA_SECTION_NODE
   * @member ENTITY_REFERENCE_NODE
   * @member ENTITY_NODE
   * @member PROCESSING_INSTRUCTION_NODE
   * @member COMMENT_NODE
   * @member DOCUMENT_NODE
   * @member DOCUMENT_TYPE_NODE
   * @member DOCUMENT_FRAGMENT_NODE
   * @member NOTATION_NODE
   */

  this.ELEMENT_NODE                   = 1;
  this.ATTRIBUTE_NODE                 = 2;
  this.TEXT_NODE                      = 3;
  this.CDATA_SECTION_NODE             = 4;
  this.ENTITY_REFERENCE_NODE          = 5;
  this.ENTITY_NODE                    = 6;
  this.PROCESSING_INSTRUCTION_NODE    = 7;
  this.COMMENT_NODE                   = 8;
  this.DOCUMENT_NODE                  = 9;
  this.DOCUMENT_TYPE_NODE             = 10;
  this.DOCUMENT_FRAGMENT_NODE         = 11;
  this.NOTATION_NODE                  = 12;

});
