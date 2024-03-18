/**
 * Functions for adding content to elements.
 * @module @lumjs/web-core/content
 */

"use strict";

const core = require('@lumjs/core');
const {S} = core.types;
const {lock} = core.obj;

const U = require('./utils');
const {VALID_TAG} = U;

/**
 * A set of constant values for use as `pos` arguments.
 * 
 * The string values are those supported by the `insertAdjacent*` DOM methods.
 * 
 * @alias module:@lumjs/web-core/content.POS
 * @type {object}
 * 
 * @prop {string} BEFORE - `"beforebegin"` → Insert before the element.
 * @prop {string} AFTER  - `"afterend"`    → Insert after the element.
 * @prop {string} FIRST  - `"afterbegin"`  → Insert as first child of element.
 * @prop {string} LAST   - `"beforeend"`   → Insert as last child of element.
 */
const POS = lock(
{
  BEFORE: 'beforebegin',
  AFTER:  'afterend',
  FIRST:  'afterbegin',
  LAST:   'beforeend',
});

/**
 * Add content to an element.
 * 
 * @param {Element} elem Element to add content to.
 * @param {(string|object)} content Content to add.
 * 
 * If this is a `string` then the following logic applies:
 * - If it appears to be a valid HTML element tag name,
 *   adds a new empty element. e.g. `"br"` becomes `<br/>`.
 * - If it starts with '<' and ends with '>' (ignoring leading
 *   or trailing whitespace), it will be passed to `addHTML()`.
 * - Anything else is passed to `addText()`.
 * 
 * If this is an `object`, it may be any one of:
 * - An `Element` instance.
 * - A `NodeList` or `HTMLCollection` instance.
 * - An `Array` of the above `object` or `string` values.
 * 
 * @param {string} [pos="beforeend"] Position to add content at.
 * 
 * May be any value supported by `Element.insertAdjacentElement()`;
 * See {@link module:@lumjs/web-core/content.POS} for a list.
 *
 * @alias module:@lumjs/web-core/content.addContent
 */
function addContent(elem, content, pos=POS.LAST)
{
  if (typeof content === S)
  {
    if (VALID_TAG.test(content))
    { // A tag name, let's make it into an empty element.
      content = document.createElement(elem);
    }
    else
    {
      if (U.guessHTML(content))
      { // Assuming an HTML snippet.
        addHTML(elem, content, pos);
      }
      else
      { // Anything else is plain old text.
        addText(elem, content, pos);
      }
      return;
    }
  }
  else if (Array.isArray(content) || U.isContainer(content))
  {
    for (const item of content)
    {
      addContent(elem, item, pos);
    }
    return;
  }

  elem.insertAdjacentElement(pos, content);
}

/**
 * Add any valid HTML to an element.
 * 
 * @param {Element} elem Element to add HTML to.
 * @param {string} html HTML source to add.
 * @param {string} [pos="beforeend"] Position to add content at.
 * 
 * May be any valud supported by `Element.insertAdjacentHTML()`;
 * See {@link module:@lumjs/web-core/content.POS} for a list.
 * 
 * @alias module:@lumjs/web-core/content.addHTML
 */
function addHTML(elem, html, pos=POS.LAST)
{
  elem.insertAdjacentHTML(pos, html);
}

/**
 * Add a text node to an element.
 * 
 * @param {Element} elem Element to add HTML to.
 * @param {string} text The text value to add.
 * @param {string} [pos="beforeend"] Position to add content at.
 * 
 * May be any valud supported by `Element.insertAdjacentText()`;
 * See {@link module:@lumjs/web-core/content.POS} for a list.
 * 
 * @alias module:@lumjs/web-core/content.addText
 */
function addText(elem, text, pos=POS.LAST)
{
  elem.insertAdjacentText(pos, text);
}

module.exports =
{
  VALID_TAG, POS, addContent, addHTML, addText,
}
