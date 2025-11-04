/**
 * jQuery helpers.
 *
 * I don't use jQuery anymore, but some of the apps I interact with do.
 * This adds a few helpers to make that simpler.
 *
 * @module @lumjs/web-core/jq
 */
'use strict';

/**
 * Options for findClass() that can be set on a global basis.
 *
 * As these are global options that will affect _every_ call to
 * either findClass() or isMatch(), they should be set only once
 * in a top-level part of your web application. The default values are
 * likely fine for most typical jQuery usage (where a `jQuery` global
 * variable is defined, the most common setup in a web browser context).
 *
 * @alias module:@lumjs/web-core/jq.OPTS
 * @prop {?function} get - Getter for jQuery class. 
 *
 * If set, this will be called and MUST return the jQuery class constructor.
 *
 * Default: `null`
 *
 * @prop {string} global - jQuery global variable. 
 *
 * If no `get` is set then we will look for a global variable with this name.
 *
 * Default: `jQuery`
 *
 */
const OPTS =
{
  get: null,
  global: 'jQuery',
}

/**
 * A function that will try to get the jQuery class/function.
 * @alias module:@lumjs/web-core/jq.findClass
 * @returns {(function|undefined)} The jQuery constructor, if found.
 */
const findClass = () => 
  ((typeof OPTS.get === 'function') 
  ? OPTS.get()
  : globalThis[OPTS.global]);

/**
 * See if a value passed is a jQuery selection match instance.
 *
 * This will always return false if the findClass() function
 * cannot find the jQuery constructor function.
 *
 * @alias module:@lumsj/web-core/jq.isMatch
 * @param {mixed} val - Value to test.
 * @param {boolean} [allowEmpty=false] Should empty jQuery instances count?
 *
 * If this is `false` (the default value) then only jQuery instances with
 * at least one matching element will be considered valid. You can set this
 * to `true` to allow jQuery match instances that did not match any elements.
 *
 * @returns {boolean}
 */
function isMatch(val, allowEmpty=false)
{
  let JQ = findClass();
  return ((typeof JQ === 'function')
    && (val instanceof JQ)
    && (allowEmpty || val.length > 0));
}

module.exports = {OPTS, findClass, isMatch}
