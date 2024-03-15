/**
 * Functions for parsing HTML and XML.
 * @module @lumjs/web-core/parser
 */
"use strict";

const core = require('@lumjs/core');
const {F} = core.types;

/**
 * A list of MIME-type values for `DOMParser.parseFromString()`
 * which is used internally by all of the functions in this module.
 * 
 * @alias module:@lumjs/web-core/parser.MIME_TYPES
 * @prop {string} HTML     - "text/html"
 * @prop {string} XML      - "application/xml"
 * @prop {string} XMLTEXT  - "text/xml"
 * @prop {string} XHTML    - "application/xhtml+xml"
 * @prop {string} SVG      - "application/svg+xml"
 * 
 */
const MIME_TYPES = Object.freeze(
{
    HTML: 'text/html',
    XML: 'application/xml',
    XMLTEXT: 'text/xml',
    XHTML: 'application/xhtml+xml',
    SVG: 'image/svg+xml',
});

/**
 * Parse HTML source.
 * 
 * @param {string} text - The HTML source to parse.
 * @param {object} [opts] Options
 * 
 * @param {boolean} [opts.raw=false] Return full HTML document?
 * 
 * If this is `true` we return the full HTML document as returned by
 * `DOMParser.parseFromString()`.
 * 
 * Despite the default value being `false`, this will be forced to 
 * `true` if no `<body/>` element was found in the parsed document.
 * 
 * @param {boolean} [opts.multiple] Return as array?
 * 
 * If `true` returns an Array of the children from the `<body/>`
 * element in the parsed document. Automatically _adopts_ all of the
 * children into the global `document`.
 *
 * The defaults to `false` if there is only one child in the
 * parsed `<body/>`; for more than 1 child it defaults to `true`.
 * 
 * @param {boolean} [opts.allNodes=false] Use _ALL_ nodes?
 * 
 * The `opts.multiple` option will use `body.childNodes` rather
 * than the default of using `body.children` (only `Element` children.)
 * 
 * @returns {mixed} Output depends on input and options:
 * 
 * - If `options.raw` is `true` this will return an `HTMLDocument` object.
 * - If `options.mutiple` is `true` this will return an `Array` of children.
 * - If the `<body/>` has at least one child, this will return an `Element`.
 * - If none of the above match, this will return `null`.
 * 
 * @alias module:@lumjs/web-core/parser.parseHTML
 */
function parseHTML(text, opts={})
{
  const parser = new DOMParser();
  const html = parser.parseFromString(text, MIME_TYPES.HTML);
  const body = html.body;

  if (opts.raw || !body)
  { // Return the raw parsed HTML document.
    return html;
  }

  const allNodes = opts.allNodes ?? false;
  const elemCount 
    = allNodes 
    ? body.childNodes.length 
    : body.childElementCount;
  const multiple = opts.multiple ?? (elemCount > 1);

  if (multiple)
  { // Return an array of child elements.
    let elements = allNodes ? body.childNodes : body.children;
    elements = Array.from(elements);
    for (const element of elements)
    {
      document.adoptNode(element);
    }
    return elements;
  }
  else
  { // Return a single element, or null if no valid elements.
    const element = body.firstElementChild;
    if (element)
    {
      document.adoptNode(element);
    }
    return element;
  }

} // parseHTML()

exports.parseHTML = parseHTML;

/**
 * A custom Error handler for the `parseXML()` function.
 * 
 * @typedef {function} ParseXMLErrorHandler
 * @param {Element} parserError - The <parsererror/> element.
 * @param {XMLDocument} xmlDoc - The parsed XML document.
 * @returns {mixed} What `parseXML()` should return on a parse error.
 */

/**
 * Parse XML source.
 * 
 * @param {text} text - XML source to parse.
 * @param {object} [opts] Options
 * 
 * @param {(boolean|ParseXMLErrorHandler)} [opts.onError] Error handling?
 * 
 * If this is boolean `true` then the function will always return the
 * `XMLDocument` returned by `DOMParser.parseFromString()`,
 * even if it has a `<parsererror/>` element.
 * 
 * If this is a `function` then it will be used to determine the
 * return value. See the `ParseXMLErrorHandler` for the arguments
 * that will be sent to the handler.
 * 
 * In any other case when a `<parsererror/>` is found, 
 * the function will report the error to the JS console, 
 * then return `null` instead of a document.
 * 
 * @param {string} [opts.type="application/xml"] MIME-type for DOM Parser.
 * 
 * You problably will never need to manually specify this.
 * If you do specify this, you should use the `MIME_TYPES` constants 
 * to ensure this is a valid value, as if the `DOMParser` doesn't
 * support the specified type, it will throw a `TypeError`.
 * 
 * @returns {mixed} Output depends on options.
 * 
 * If no parsing errors occur, this will always be an `XMLDocument`.
 * See the `opts.onError` description for other potential values.
 * 
 * @alias module:@lumjs/web-core/parser.parseXML
 */
function parseXML(text, opts={})
{
  const parser = new DOMParser();
  const mimeType = opts.type ?? MIME_TYPES.XML;
  const xmlDoc = parser.parseFromString(text, mimeType);

  if (opts.onError === true)
  { // Always return the doc regardless of parse errors.
    return xmlDoc;
  }

  const parseErrors = xmlDoc.querySelector("parseerror");
  if (parseErrors)
  { // Parse errors found.
    if (typeof opts.onError === F)
    { // Custom error handler passed.
      return opts.onError(xmlDoc);
    }
    else
    { 
      console.error("parser errors occurred", parseErrors, 
      {
        text, opts, xmlDoc,
      });

      return null;
    }
  }
  else
  { // No errors found, return the doc.
    return xmlDoc;
  }
}

exports.parseXML = parseXML;
