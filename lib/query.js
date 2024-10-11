/**
 * Query helpers
 * @module @lumjs/web-core/query
 */
"use strict";

const core = require('@lumjs/core');
const {S,F,B,isObj,def} = core.types;

const {isQueryable,getNested,isCollection} = require('./utils');

const SUB_QUERY = /[\s,>]+/;

/**
 * Is the string a query for a singular element?
 * 
 * @param {string} selector Query selector
 * @returns {boolean}
 * @alias module:@lumjs/web-core/query.isSingular
 */
function isSingular(selector)
{
  if (!typeof selector === S)
  {
    throw new TypeError("selector must be a string");
  }

  selector = selector.trim();
  return (selector.startsWith('#') && !SUB_QUERY.test(selector));
}

exports.isSingular = isSingular;

/**
 * A wrapper around querySelector and querySelectorAll,
 * with some extra filtering features that adds significant power.
 * 
 * @param {...any} args - The type determines what the argument is for.
 * 
 * - A _queryable_ object instance will be used as the `node` to search in. 
 *   If no node is explicitly specified, the global `document` will be used.
 *   See {@link module:@lumjs/web-core/utils.isQueryable} for details.
 *   Only **ONE** _queryable_ argument is supported.
 * - A `boolean` value will explicitly set if we want _multiple_ matches.
 *   Only **ONE** `boolean` argument is supported.
 *   If **NO** `boolean` value is passed, the following logic will be used:
 *   - A single selector starting with a `#` and having _NO_ spaces, commas,
 *     or `>` symbols will set the _multiple_ option to `false`.
 *   - Anything else will set the _multiple_ option to `true`.
 * - Any `string` arguments will be assumed to be _selector queries_ for
 *   the `querySelector*` methods. Any number may be passed; they will be
 *   joined into a single selector `string` using commas.
 * - Any `function` arguments will be used to filter the elements further.
 *   Each function will be passed an element and must return a `boolean`
 *   indicating if it passed the test and should be included. Unlike the
 *   query strings where _any_ query may pass, _all_ filter tests must pass
 *   for the element to be included in the returned list.
 * - A plain `object` (non-instance) may be passed to be used as the options
 *   for the `getNested()` function, which is only used if **NO** `string`
 *   arguments were passed. Only **ONE** plain `object` is supported.
 *   See {@link module:@lumjs/web-core/utils.getNested} for details.
 * - A `FindResult` object instance to wrap the returned results in.
 *   See {@link module:@lumjs/web-core/query.FindResult} for details.
 * 
 * At _least_ **ONE** `string` _OR_ `function` argument **MUST** be passed
 * for this function to be valid. It will return `null` or an empty array 
 * if neither of those arguments were specified.
 * 
 * @returns {mixed} Output depends on passed arguments.
 * 
 * - If a `FindResult` object was passed, it will be the return value.
 * 
 * - If the _multiple_ option is `false` then this will return either
 *   a single `Element` or `null` if no elements passed the tests.
 * 
 * - If a filter `function` was specified then multiple elements will be
 *   returned as an `Array`, otherwise the return value will be the 
 *   `NodeList` from `querySelectorAll()`.
 * 
 * @alias module:@lumjs/web-core/query.find
 */
function find(...args)
{
  const opts =
  {
    node: document,
    multiple: null,
    selectors:  [],
    filters:    [],
    nestOpts: null,
  }

  // An optional result wrapper object.
  let resultObj = null;

  // Log errors/warnings with a common format.
  const log = (at, msg, data) => 
  {
    const info =
    {
      at, 
      opts, 
      args,
      data,
    }
    
    console.error(msg, info);

    if (resultObj)
    {
      resultObj.logs.push({msg, info})
    }
  }
  
  for (let a=0; a < args.length; a++)
  {
    const arg = args[a];

    if (typeof arg === B)
    { 
      if (opts.multiple === null)
      {
        opts.multiple = arg;
      }
      else
      {
        log(a, "the 'multiple' option was already set", arg);
      }
    }
    else if (typeof arg === S)
    { // A string is always considered a selector.
      opts.selectors.push(arg);
    }
    else if (typeof arg === F)
    { // A function is always considered a filter.
      opts.filters.push(arg);
    }
    else if (arg instanceof FindResult)
    { // A custom result instance.
      if (resultObj === null)
      {
        resultObj = arg;
      }
      else
      {
        log(a, "a FindResult instance was already passed", arg);
      }
    }
    else if (isQueryable(arg))
    { // The root node from which our query begins.
      if (opts.node === document)
      {
        opts.node = arg;
      }
      else
      {
        log(a, "the 'node' option was already set", arg);
      }
    }
    else if (isObj(arg))
    { // Options for the getNested method.
      if (opts.nestOpts === null)
      {
        opts.nestOpts = arg;
      }
      else
      {
        log(a, "the 'nestOpts' option was already set", arg);
      }
    }
    else
    {
      log(a, "unsupported argument value", arg);
    }

  } // for args

  let found;

  const getResult = () => (resultObj 
    ? resultObj.found(found, opts) 
    : found);

  if (opts.selectors.length === 0 && opts.filters.length === 0)
  {
    log(-1, "no selectors or filters specified", opts);
    found = (opts.multiple ? [] : null);
    return getResult();
  }

  if (opts.multiple === null)
  { // Determine multiple option automatically.
    opts.multiple = true;
    if (opts.selectors.length === 1 && isSingular(opts.selectors[0]))
    { // Only one, '#id' type selector specified.
      opts.multiple = false;
    }
  }

  if (opts.selectors.length > 0)
  { // Search using a query selector.
    const query = opts.selectors.join(',');

    if (opts.multiple)
    {
      found = opts.node.querySelectorAll(query);
    }
    else
    {
      found = opts.node.querySelector(query);
    }
  }
  else
  { 
    if (opts.multiple)
    { // Going to use all nested elements.
      found = getNested(opts.node, opts.nestOpts);
    }
    else
    { // Just the first child.
      found = opts.node.firstElementChild;
    }
  }

  if (opts.filters.length > 0)
  { // Filters to apply.
    if (!opts.multiple) 
    { // Wrap the single in an array for simplicity.
      found = [found];
    }

    const filtered = [];
    
    eachNode: for (const node of found)
    {
      for (const filter of opts.filters)
      {
        if (!filter(node))
        { // Didn't pass a filter test, skip this node.
          continue eachNode;
        }
      }
      // If we reached here the node passed the tests.
      filtered.push(node);
    }

    if (opts.multiple)
    { // Use the filtered array as the list of found items.
      found = filtered;
    }
    else
    { // If the one item passed, return it, otherwise return null.
      found = (filtered.length ? filtered[0] : null);
    }
  }
  
  return getResult();

} // find()

exports.find = find;

// Private constants.
const OPT = 'options', FND = 'found', LOG = 'logs';

/**
 * An optional class for wrapping the results of `find()` in.
 * @alias module:@lumjs/web-core/query.FindResult
 * 
 * @property {?object} options - The final options compiled by `find()`.
 * 
 * If this result object has not been initialized yet, this will be `null`.
 * 
 * @property {(Document|DocumentFragment|Element)} options.node - Parent node.
 * @property {boolean} options.multiple - If we looked for multiple results.
 * @property {string[]} options.selectors - Any query selectors passed.
 * @property {function[]} options.filters - Any filter functions passed.
 * @property {?object} options.nestOpts - Options for `getNested()` method.
 * Will be `null` if no options object was passed to `find()`.
 * 
 * @property {mixed} found - The unwrapped return value from `find()`.
 * 
 * If this result object has not been initialized yet, this will be
 * a private setter `function` for internal use only and should never be 
 * called by anything other than the `find()` function itself.
 * 
 * @property {Array} logs - Copies of any error log messages from `find()`.
 * 
 */
class FindResult
{
  /**
   * Create a new FindResult instance. Has no arguments.
   */
  constructor()
  {
    def(this, FND, setFound);
    def(this, OPT, {value: null});
    def(this, LOG, {value: []});
  }

  /**
   * Was this instance initialized by `find()` ?
   * @type {boolean}
   */
  get initialized()
  {
    return (typeof this.found !== F);
  }

  /**
   * The number of results found.
   * @type {number}
   */
  get length()
  {
    if (this.found instanceof Element)
    { // One element.
      return 1;
    }
    else if (isCollection(this.found))
    { // Proxy to the collection's length.
      return this.found.length;
    }
    else
    { // Nothing valid found.
      return 0;
    }
  }

  /**
   * The first element found.
   * @type {?Element}
   */
  get first()
  {
    if (this.found instanceof Element)
    {
      return this.found;
    }
    else if (isCollection(this.found))
    {
      return this.found[0] ?? null;
    }
    else
    {
      return null;
    }
  }

  /**
   * The last element found.
   * @type {?Element}
   */
  get last()
  {
    if (this.found instanceof Element)
    {
      return this.found;
    }
    else if (isCollection(this.found))
    {
      const len = this.found.length;
      return this.found[len-1] ?? null;
    }
    else
    {
      return null;
    }
  }

  /**
   * An array of all elements that were found.
   * Unlike the `found` value, this will always be an array.
   * @type {Array}
   */
  get results()
  {
    if (this.found instanceof Element)
    {
      return [this.found];
    }
    else if (isCollection(this.found))
    { 
      return Array.from(this.found);
    }
    else
    {
      return [];
    }
  }

} // FindResult class

exports.FindResult = FindResult;

/**
 * A **private** initialization method for `FindResult` objects.
 * 
 * On un-initialized `FindResult` instances, this will be the value 
 * of the `found` property. Is only callable _ONCE_ on an instance, 
 * as it overwrites the property with the return value from `find()`.
 * 
 * @name module:@lumjs/web-core/query.FindResult~setFound
 * @private
 * @param {mixed} found - Value to assign to `found` property.
 * @param {object} options - Value to assign to `options` property.
 * @returns {object} The `FindResult` instance itself.
 */
function setFound(found, options)
{
  if (found === undefined || !isObj(options))
  {
    console.error({found, options, arguments, findResult: this});
    throw new TypeError("Invalid arguments to private setter");
  }

  def(this, FND, {value: found});
  def(this, OPT, {value: options});

  return this;
}

/**
 * Call `find()` with a `FindResult` object.
 * 
 * This literally just creates a new `FindResult` instance,
 * then passes it and the rest of the arguments to `find()`.
 *
 * This function is also available as `find.with()`.
 * 
 * @alias module:@lumjs/web-core/query.findWith
 * @param  {...any} args - Same as `find()`
 * @returns {module:@lumjs/web-core/query.FindResult}
 * @see {@link module:@lumjs/web-core/query.find}
 */
function findWith(...args)
{
  const result = new FindResult();
  return find(result, ...args);
}

exports.findWith = findWith;

def(find, 'with', findWith);

