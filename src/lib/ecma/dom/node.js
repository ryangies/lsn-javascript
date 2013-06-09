/**
 * @namespace dom.node
 * Utility functions which compare the C<nodeType> attribute.
 */

ECMAScript.Extend('dom.node', function (ecma) {

  /**
   * @function isElement
   * Returns true if it is.
   *  var bool = ecma.dom.node.isElement(elem);
   */

  this.isElement = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.ELEMENT_NODE &&
      node.tagName != '!';
  };

  /**
   * @function isAttribute
   * Returns true if it is.
   *  var bool = ecma.dom.node.isAttribute(elem);
   */

  this.isAttribute = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.ATTRIBUTE_NODE;
  };

  /**
   * @function isText
   * Returns true if it is.
   *  var bool = ecma.dom.node.isText(elem);
   */

  this.isText = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.TEXT_NODE;
  };

  /**
   * @function isCdataSection
   * Returns true if it is.
   *  var bool = ecma.dom.node.isCdataSection(elem);
   */

  this.isCdataSection = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.CDATA_SECTION_NODE;
  };

  /**
   * @function isEntityReference
   * Returns true if it is.
   *  var bool = ecma.dom.node.isEntityReference(elem);
   */

  this.isEntityReference = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.ENTITY_REFERENCE_NODE;
  };

  /**
   * @function isEntity
   * Returns true if it is.
   *  var bool = ecma.dom.node.isEntity(elem);
   */

  this.isEntity = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.ENTITY_NODE;
  };

  /**
   * @function isProcessingInstruction
   * Returns true if it is.
   *  var bool = ecma.dom.node.isProcessingInstruction(elem);
   */

  this.isProcessingInstruction = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.PROCESSING_INSTRUCTION_NODE;
  };

  /**
   * @function isComment
   * Returns true if it is.
   *  var bool = ecma.dom.node.isComment(elem);
   */

  this.isComment = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.COMMENT_NODE;
  };

  /**
   * @function isDocument
   * Returns true if it is.
   *  var bool = ecma.dom.node.isDocument(elem);
   */

  this.isDocument = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.DOCUMENT_NODE;
  };

  /**
   * @function isDocumentType
   * Returns true if it is.
   *  var bool = ecma.dom.node.isDocumentType(elem);
   */

  this.isDocumentType = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.DOCUMENT_TYPE_NODE;
  };

  /**
   * @function isDocumentFragment
   * Returns true if it is.
   *  var bool = ecma.dom.node.isDocumentFragment(elem);
   */

  this.isDocumentFragment = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.DOCUMENT_FRAGMENT_NODE;
  };

  /**
   * @function isNotation
   * Returns true if it is.
   *  var bool = ecma.dom.node.isNotation(elem);
   */

  this.isNotation = function (node) {
    node = ecma.dom.getElement(node);
    return node && node.nodeType &&
      node.nodeType == ecma.dom.constants.NOTATION_NODE;
  };

});
