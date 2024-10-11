/**
 * Various utility functions.
 * @module @lumjs/web-core/utils
 */
"use strict";

const core = require('@lumjs/core');
const {F,N,isObj,isArrayOf} = core.types;

/**
 * Is the argument a DOM container?
 * 
 * For the purposes of this method a DOM container is either
 * a `NodeList` or `HTMLCollection` object.
 * 
 * @param {*} subject - Subject we are testing.
 * @returns {boolean}
 * @alias module:@lumjs/web-core/utils.isContainer
 */
function isContainer(subject)
{
  return (subject instanceof NodeList || subject instanceof HTMLCollection);
}

exports.isContainer = isContainer;

/**
 * Is the argument a Node with `querySelector*` methods?
 * 
 * At this time only `Element`, `Document`, and `DocumentFragment`
 * have the `querySelector()` and `querySelectorAll()` methods.
 * 
 * @param {*} subject - Subject we are testing.
 * @returns {boolean}
 * @alias module:@lumjs/web-core/utils.isQueryable
 */
function isQueryable(subject)
{
  return ( // Only nodes with querySelector* methods
       subject instanceof Element 
    || subject instanceof Document
    || subject instanceof DocumentFragment);
}

exports.isQueryable = isQueryable;

/**
 * Is the argument a DOM container or an Array of Elements/Nodes?
 * 
 * A simple wrapper around `isContainer()` and the `isArrayOf()` method
 * from the `@lumjs/core` package.
 * 
 * @param {*} subject - Subject we are testing.
 * 
 * @param {function} [wanted=Element] Class constructor for `isArrayOf()`.
 * 
 * Other than the default of `Element`, other classes that may be useful
 * here are `Node` or `EventTarget`.
 * 
 * @param {object} [opts] Advanced options for `isArrayOf()`.
 * 
 * The `value` option will _always_ be set to the `subject` argument;
 * so only options other than `value` may be set here.
 * 
 * @returns {boolean} Will be `true` if either one of the two tests passed.
 * 
 * @alias module:@lumjs/web-core/utils.isCollection
 */
function isCollection(subject, wanted=Element, opts={})
{
  opts.value = subject;
  return (isContainer(subject) || isArrayOf(opts, wanted));
}

exports.isCollection = isCollection;

/**
 * Run a callback function when the DOM is ready.
 * 
 * If the DOM is ready when this is called, the callback
 * will be executed immediately.
 * 
 * @param {function} [callback] Callback function
 * 
 * If not specified, this will return a `Promise` that resolves
 * when the DOM is ready.
 * 
 * @returns {?Promise} Only returns a `Promise` when no `callback`.
 * 
 * @alias module:@lumjs/web-core/utils.whenDOMReady
 */
function whenDOMReady(callback)
{
  if (typeof callback === F)
  {
    if (document.readyState === 'loading')
    {
      document.addEventListener('DOMContentLoaded', callback);
    }
    else
    {
      callback.call(document);
    }
  }
  else
  {
    return new Promise(resolve => whenDOMReady(resolve));
  }
}

exports.whenDOMReady = whenDOMReady;

/**
 * Run a callback function when the Window is fully loaded.
 * 
 * If the Window is loaded when this is called, the callback
 * will be executed immediately.
 * 
 * @param {function} [callback] Callback function
 * 
 * If not specified, this will return a `Promise` that resolves
 * when the Window is fully loaded.
 * 
 * @returns {?Promise} Only returns a `Promise` when no `callback`.
 * 
 * @alias module:@lumjs/web-core/utils.whenWindowReady
 */
function whenWindowReady(callback)
{
  if (typeof callback === F)
  {
    if (this.document.readyState === 'complete')
    {
      callback.call(this.window);
    }
    else
    {
      this.window.addEventListener('load', callback);
    }
  }
  else
  {
    return new Promise(resolve => whenWindowReady(resolve));
  }
}

exports.whenWindowReady = whenWindowReady;

/**
 * Get a flat list of nested elements/nodes.
 * 
 * @param {(Element|Document)} parent - The top-level parent element.
 * 
 * @param {object} [opts] Options affecting behaviour.
 * @param {boolean} [opts.allNodes=false] Get `Node` rather than `Element`?
 * Simply uses `parent.childNodes` instead of `parent.children`.
 * @param {number} [opts.depth=99] Depth to recurse to.
 * 
 * This is how many levels of children to add to the list.
 * 
 * If you set this to `0` only the immediate children of the `parent` will
 * be returned. Which would be kinda redundant.
 * 
 * @param {Array} [retList] The list that will be populated.
 * 
 * This is likley not something you'll ever need to set yourself.
 * It's used internally for the recurive nature of this method.
 * 
 * @returns {Array} The populated `retList`.
 * 
 * @alias module:@lumjs/web-core/utils.getNested
 */
function getNested(parent, opts={}, retList=[])
{
  const allNodes = opts.allNodes ?? false;
  const depth = typeof (opts.depth === N) ? opts.depth : 99;

  const children = allNodes ? parent.childNodes : parent.children;
  retList.push(...children); // Add the direct children now.

  if (depth > 0)
  { // We're going to recurse further.
    const nestOpts = {allNodes, depth: depth-1};
    for (const child of children)
    {
      getNested(child, nestOpts, retList);
    }
  }

  return retList;
}

exports.getNested = getNested;

/**
 * A simple RegExp for valid HTML/XML element tag names.
 * @alias module:@lumjs/web-core/utils.VALID_TAG
 */
const VALID_TAG = /^[\w\-\:\.]+$/;

exports.VALID_TAG = VALID_TAG;

/**
 * Guess if a string is an HTML (or XML) snippet.
 * 
 * This is a dead-stupid test that after trimming leading/trailing
 * whitespace, checks if the string starts with `<` and ends with `>`.
 * 
 * @param {string} string - The string to check.
 * @returns {boolean}
 * @alias module:@lumjs/web-core/utils.guessHTML
 */
function guessHTML(string)
{
  string = string.trim();
  return (string.startsWith('<') && string.endsWith('>'));
}

exports.guessHTML = guessHTML;

/**
 * Empty a container.
 * 
 * Sometimes you need to remove everything from a container.
 * 
 * @param {(Node|Array|object)} container - Container to empty.
 * 
 * This explicitly supports DOM `Node` and JS `Array` objects.
 * It also implicitly supports JS `Map` and `Set` objects, or any
 * other object that has a `clear()` method.
 * 
 * @returns {object} `container`
 * @alias module:@lumjs/web-core/utils.empty
 */
function empty(container)
{
  if (container instanceof Node)
  {
    while (container.firstChild)
    {
      container.removeChild(container.lastChild);
    }
  }
  else if (Array.isArray(container))
  {
    container.length = 0;
  }
  else if (isObj(container) && typeof container.clear === F)
  {
    container.clear();
  }
  else
  {
    console.error("Unsupported container", {container});
  }

  return container;
}

exports.empty = empty;

/**
 * Get (or build) a `Map` stored inside a target using a `Symbol` property.
 * 
 * While this function was originally defined here, it has been
 * moved to `@lumjs/core/maps.getSymbolMap`, and this is just an alias.
 * This is just a summary of the documentation for this function.
 * See the `@lumjs/core` documentation for the full version.
 * 
 * @name module:@lumjs/web-core/utils.getSymbolMap
 * @type {function}
 * 
 * @param {(object|function)} target - The target for the Map storage.
 * @param {(Symbol|string)}   symbol - Symbol used to store the Map.
 * 
 * @returns {Map}
 * @throws {TypeError}
 */
exports.getSymbolMap = core.maps.getSymbolMap;

/**
 * A Key-Value Cache using a _Symbol Map_ for storage.
 * 
 * This is a convenience alias to `@lumjs/core/maps.getSymbolCache`.
 * It is only here for consistency with `getSymbolMap()`.
 * This is just a summary of the documentation for this function.
 * See the `@lumjs/core` documentation for the full version.
 * 
 * @name module:@lumjs/web-core/utils.getSymbolCache
 * @type {function}
 * 
 * @param {(object|function)} target - For `getSymbolMap()`
 * @param {(Symbol|string)}   symbol - For `getSymbolMap()`
 * 
 * @param {mixed} key - The key you want the value for.
 * @param {function} generator - Used if `key` is not found.
 * @param {boolean} [reset=false] Reset the value using the `generator`
 * @returns {mixed} The cached value, or return value of the `generator`
 * 
 * @throws {TypeError}
 */
exports.getSymbolCache = core.maps.getSymbolCache;
