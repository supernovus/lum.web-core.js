/**
 * Various utility functions.
 * @module @lumjs/web-core/utils
 */
"use strict";

const core = require('@lumjs/core');
const {F,SY,isObj,isComplex,def} = core.types;

/**
 * Is the argument a DOM container?
 * 
 * For the purposes of this method a DOM container is either
 * a `NodeList` or `HTMLCollection` object.
 * 
 * @param {*} subject Item we are testing.
 * @returns {boolean} If the item was a DOM container.
 * @alias module:@lumjs/web-core/utils.isContainer
 */
function isContainer(subject)
{
  return (subject instanceof NodeList || subject instanceof HTMLCollection);
}

exports.isContainer = isContainer;

/**
 * Is the subject an array of objects of a certain type?
 * 
 * @param {*} subject Subject we're testing.
 * @param {function} [wanted=Node] Class the items must be instances of.
 * @returns {boolean} 
 * 
 * This will only return `true` if the `subject` is an `Array`,
 * and every member of that array is an instance of `wanted`.
 * 
 * @alias module:@lumjs/web-core/utils.isArrayOfInstances
 */
function isArrayOfInstances(subject, wanted=Node)
{
  if (typeof wanted !== F)
  {
    throw new TypeError("wanted argument must be a class constructor");
  }

  if (!Array.isArray(subject)) return false;

  for (const item of subject)
  {
    if (!(item instanceof wanted))
    {
      return false;
    }
  }

  return true;
}

exports.isArrayOfInstances = isArrayOfInstances;

/**
 * Is the argument a DOM container or an Array of Elements/Nodes?
 * 
 * A simple wrapper around `isContainer()` and `isArrayOfInstances()`.
 * 
 * @param {*} subject Subject we are testing.
 * @param {function} [wanted=Element] Class for `isArrayOfInstances()`.
 * @returns {boolean} Will be `true` if one of the two tests passed.
 * 
 * @alias module:@lumjs/web-core/utils.isCollection
 */
function isCollection(subject, wanted=Element)
{
  return (isContainer(subject) || isArrayOfInstances(subject, wanted));
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
 * Get a `Map` stored inside any `object` or `function`
 * identified by a private `Symbol`.
 * 
 * It will build the Map the first time this is called on
 * a given target, then use the existing instance for subsequent calls.
 * 
 * @alias module:@lumjs/web-core/utils.getSymbolMap
 * @param {(object|function)} target - The object we want stored data from.
 * @param {symbol} symbol - The private symbol for the stored data.
 * @returns {Map} A Map specifically for storing private data.
 */
function getSymbolMap(obj, symbol)
{
  if (typeof symbol !== SY)
  {
    throw new TypeError("Invalid symbol");
  }

  if (!isComplex(obj))
  {
    throw new TypeError("Invalid target object or function");
  }

  if (!isObj(obj[symbol]))
  { // Hadn't created it yet.
    def(obj, symbol, new Map());
  }

  return obj[symbol];
}

exports.getSymbolMap = getSymbolMap;
