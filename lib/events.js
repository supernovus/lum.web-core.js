/**
 * Functions for registering event handlers.
 * @module @lumjs/web-core/events
 */

"use strict";

const core = require('@lumjs/core');
const {S,F,def,isObj} = core.types;
const {isCollection} = require('./utils');
const WSP = /\s+/;

/**
 * Add a delegated event handler.
 * 
 * Event delegation is powerful, but not exactly straightforward in the
 * regular DOM. This helps make it easier to handle.
 * 
 * @param {Element} parentElem Parent element containing delegate children.
 * @param {string} event Name of the DOM event we are listening for.
 * @param {(string|function)} selector How we determine a valid delegate.
 * 
 * If this is a `string` it is assumed to be a CSS-style query, and the
 * potential delegates will be tested using the `.matches()` method.
 * 
 * If this is a `function` it is assumed to be a test that will be passed
 * the potential delegate Element, and must return a boolean value to
 * indicate if it is a valid delegate or not.
 * 
 * @param {(function|object)} handler The event listener for the delegate.
 * 
 * If this is a `function` (recommended) then it will be called with the
 * delegate as `this`, and the event from the delegation listener passed
 * as the sole argument.
 * 
 * If this is an `object` with a `handleEvent()` method defined, then it
 * will be called and passed the event from the delegation listener.
 * 
 * In either case, the event object will be slightly modified before
 * the `handler` is called; it will have a few added and possibly modified
 * property values:
 * 
 * The event will always have an additional `captureTarget` property 
 * pointing to the original `this` (which should be the same as 
 * `parentElem` in most cases.)
 * 
 * If the delegated Element is _not_ the original `target`, then it will
 * have an `originalTarget` property containing the original `target`
 * property value. The `target` property will be overridden with the
 * delegate Element.
 * 
 * @param {object} opts Options for addEventListener.
 * 
 * @returns {function} The delegation listener method.
 * 
 * This is the function assigned using `parentElem.addEventListener()`,
 * and what you will need to pass to `parentElem.removeEventListener()`
 * in the case that you need to unregister the event handler.
 * 
 * @alias module:@lumjs/web-core/events.addDelegatedEvent
 */
function addDelegatedEvent(parentElem, event, selector, handler, opts={})
{
  // Internal function to find the desired delegate element.
  function findDelegate(targetElem)
  {
    if (!(targetElem instanceof Element))
    { // Cannot continue, the target isn't an element.
      return null;
    }

    if (typeof selector === S)
    {
      if (targetElem.matches(selector))
      {
        return targetElem;
      }
    }
    else if (typeof selector === F)
    {
      if (selector(targetElem))
      {
        return targetElem;
      }
    }
    else
    {
      console.error({selector, args: Array.from(arguments)});
      throw new TypeError("Invalid selector");
    }
    
    if (targetElem === parentElem)
    { // Cannot continue, current target is the original parent.
      return null;
    }
    
    return findDelegate(targetElem.parentElement);
  }

  const listener = function(ev)
  {
    const delegate = findDelegate(ev.target);

    /*console.debug(
    {
      parentElem, event, selector, handler, opts,
      ev, delegate,
    });*/

    if (delegate instanceof Element)
    {
      def(ev, 'captureTarget', {value: this});
      if (delegate !== ev.target)
      { // Going to remap the target.
        def(ev, 'originalTarget', {value: ev.target});
        def(ev, 'target', {value: delegate});
      }

      if (typeof handler === F)
      { // A standard function handler.
        return handler.call(delegate, ev);
      }
      else if (isObj(handler) && typeof handler.handleEvent === F)
      { // Object handlers are treated differently.
        return handler.handleEvent(ev, delegate);
      }
    }
  }

  parentElem.addEventListener(event, listener, opts);

  return listener;
}

exports.addDelegatedEvent = addDelegatedEvent;

/**
 * See if passed argument is a valid event listener.
 * 
 * Will be considered valid if argument is a `function`,
 * or if argument is an `object` with a `handleEvent` method.
 * 
 * @param {*} what Argument we are testing.
 * @returns {boolean}
 * 
 * @alias module:@lumjs/web-core/events.isListener
 */
function isListener(what)
{
  return (typeof what === F || (isObj(what) && typeof what.handleEvent === F));
}

exports.isListener = isListener;

/**
 * Assign a single event handler to an Element.
 * 
 * @param {...(*)} args Arguments may be passed in any order.
 * 
 * Any `object` that is NOT an instance of `Element` and does NOT have
 * a `handleEvent()` method can be used to pass _named options_.
 * 
 * A target `Element` must be specified, either passed directly, 
 * or assigned using the `{target: elem}` option.
 * 
 * An event name must be specified, either directly as a `string`, 
 * or using the `{event: name}` option.
 * 
 * An event handler (which may be either a `function`, or an `object`
 * with a `handleEvent()` method) must be passed either directly,
 * or assigned to the `{handle: handler}` option.
 * 
 * If a second `string` or second `function` is passed as an argument,
 * it will be used as a delegation selector, and we'll use the
 * `addDelegatedEvent` method to register.
 * The delegation selector can also be assigned explicitly,
 * using the `{selector: stringOrFunc}` option.
 * 
 * Options for the actual `addEventListener()` call can be specified
 * as named options the same as any others. If you want to ensure they
 * are completely separate from the rest of our compiled options, 
 * you can specify the `{opts: object}` named option.
 * 
 * A named option of `{off: true}` (the value _must_ be boolean `true`)
 * can be used to assign an `off()` method to the return value.
 * 
 * @returns {object} Final compiled event options, including listeners.
 * 
 * This will always have at least a `target` element property, 
 * `event` name property, and a `handle()` event listener.
 * 
 * If a `selector` was assigned, this will also have a `delegated` 
 * property containing the delegated event listener created by the
 * `addDelegatedEvent()` method.
 * 
 * A `listener` property will always be assigned, which will be an alias
 * to `delegated` if it exists, or `handle` if no delegation was used.
 *
 * Finally, if the `{off: true}` named option was passed, it will be
 * replaced by an `off()` method that when called will remove the
 * `listener` from the `target`, basically acting as an _undo_ feature.
 * 
 * @example <caption>Examples of usage</caption>
 * 
 *   const myElem = document.querySelector('#example');
 *   const onClick = function(e) 
 *   { 
 *     console.log("clicked", e, this); 
 *   }
 *   const dsel = '.some-child';
 *   const dfun = (el) => el.classList.contains('some-child');
 * 
 *   // Assign a capturing event listener.
 *   onEvent(myElem, 'click', onClick, {capture: true});
 * 
 *   // Assign the same listener as above, using named options.
 *   onEvent(
 *   {
 *     target: myElem, 
 *     event: 'click', 
 *     handle: onClick, 
 *     opts: {capture: true},
 *   });
 * 
 *   // Delegated event using a query selector (second `string`).
 *   onEvent(myElem, 'click', dsel, onClick);
 * 
 *   // Delegated event using a custom filter (second `function`).
 *   onEvent(myElem, 'click', onClick, dfun);
 * 
 * @alias module:@lumjs/web-core/events.onEvent
 */
function onEvent()
{
  const opts = {};

  for (const arg of arguments)
  {
    if (isObj(arg))
    { 
      if (arg instanceof Element)
      { // The target element.
        opts.target = arg;
      }
      else if (!opts.handle && typeof arg.handleEvent === F)
      { // A handler object.
        opts.handle = arg;
      }
      else
      { // Assume named options.
        Object.assign(opts, arg);
      }
    }
    else if (typeof arg === F)
    { // An event handler/listener function.
      if (!opts.handle)
      { // First function is used as the handler.
        opts.handle = arg;
      }
      else if (!opts.selector)
      { // Second function is a filter-type selector.
        opts.selector = arg;
      }
      else
      {
        console.warn("Both handle and selector already set",
        {
          arg,
          args: arguments,
        });
      }
    }
    else if (typeof arg === S)
    {
      if (!opts.event)
      { // First string is used as event name.
        opts.event = arg;
      }
      else if (!opts.selector)
      { // Second string is used as selector.
        opts.selector = arg;
      }
      else
      {
        console.warn("Both event and selector already set", 
        {
          arg,
          args: arguments
        });
      }
    }
  }

  const eventOpts = isObj(opts.opts) ? opts.opts : opts;

  if (opts.selector)
  { // A selector was found, we're using delegation.
    opts.listener = opts.delegated = addDelegatedEvent(
      opts.target, 
      opts.event, 
      opts.selector, 
      opts.handle, 
      eventOpts,
    );
  }
  else
  { // No delegation, we'll assign the event listener directly.
    opts.listener = opts.handle;
    opts.target.addEventListener(
      opts.event, 
      opts.handle, 
      eventOpts
    );
  }

  if (opts.off === true)
  { // Add an off() method.
    opts.off = function()
    {
      opts.target.removeEventListener(opts.event, opts.listener, eventOpts);
    }
  }

  return opts;

} // onEvent()

exports.onEvent = onEvent;

/**
 * Assign event handlers to multiple Elements and multiple events.
 * 
 * Uses [onEvent()]{@link module:@lumjs/web-core/events.onEvent};
 * but handles the arguments differently.
 * 
 * @param {...(*)} args Arguments may be passed in any order.
 * 
 * - An `Element` instance will be used as a `target`.
 * - A *Collection* will have its Elements used as targets.
 * - A `string` will be used as one or more `event` names;
 *   the string will be trimmed of leading and trailing whitespace,
 *   and then split by any whitespace between event names.
 * - Any other value will be used as a parameter for `onEvent()`.
 * 
 * The `target`, `event`, and `off` named options cannot be overridden,
 * and will be ignored if specified in any `object` arguments.
 * 
 * @returns {module:@lumjs/web-core/events~MultiReg} MultiReg object
 * 
 * @alias module:@lumjs/web-core/events.onEvents
 */
function onEvents()
{
  const allArgs = [],
        targets = new Set(),
        events  = new Set();
  
  for (const arg of arguments)
  {
    if (arg instanceof Element)
    { // A target element.
      targets.add(arg);
    }
    else if (isCollection(arg))
    { // A collection of elements.
      for (const el of arg)
      {
        targets.add(el);
      }
    }
    else if (typeof arg === S)
    { // Event name(s).
      const enames = arg.trim().split(WSP);
      for (const en of enames)
      {
        events.add(en);
      }
    }
    else
    { // Anything else is a regular argument.
      allArgs.push(arg);
    }
  }

  const map = new Map();
  const reg =
  {
    map,
    all: [],
    for(what)
    {
      return map.get(what);
    },
    off: onEvents__off,
    [Symbol.iterator]()
    {
      return this.all.values();
    },
  }

  for (const target of targets)
  {
    const tlist = [];
    for (const event of events)
    {
      let elist;
      if (map.has(event))
      { // Event name has been seen before.
        elist = map.get(event);
      }
      else
      { // Make a list for this event name.
        elist = [];
        map.set(event, elist);
      }

      // Options for the event handler.
      const opts = {target, event, off: true}
      // Arguments for `onEvent()` with opts at beginning AND end.
      const args = [opts, ...allArgs, opts];

      // Register this target/event combo.
      const edef = onEvent(...args);
      reg.all.push(edef);
      tlist.push(edef);
      elist.push(edef);
    }
    map.set(target, tlist);
  }

  return reg;

} // onEvents()

exports.onEvents = onEvents;

// Will be added as `EventsRegistry.off()` method.
function onEvents__off()
{
  if (arguments.length > 0)
  { // Remove from specific targets or events.
    for (const arg of arguments)
    {
      const list = this.for(arg);
      if (Array.isArray(list))
      {
        for (const def of list)
        {
          def.off();
        }
      }
    }
  }
  else
  { // Remove all.
    for (const def of this.all)
    {
      def.off();
    }
  }
}

/**
 * Multiple-registration object returned from `onEvents()`;
 * is iterable (will iterate through *all* registration objects).
 * 
 * @typedef {object} module:@lumjs/web-core/events~MultiReg
 * @prop {Array} all - Registration objects for all target/event combos.
 * @prop {Map} map - A map of `target` and `event` to registration objects.
 */

/**
 * Get registration objects for a `target` Element or `event` string.
 * 
 * Is simply an alias for `this.map.get(what)`.
 * 
 * @function module:@lumjs/web-core/events~MultiReg#for
 * @param {(Element|string)} arg - The `target` Element or `event` string.
 * @returns {(Array|undefined)} An array of registration objects,
 * or `undefined` if the `arg` wasn't found in the map.
 */

/**
 * Remove event listeners registered with `onEvents()`.
 * 
 * @function module:@lumjs/web-core/events~MultiReg#off
 * @param {...(Element|String)} [args] Optional filters;
 * 
 * Uses [for()]{@link module:@lumjs/web-core/events~MultiReg#for}
 * on each argument and removes the associated event listeners
 * for that Element or event name.
 * 
 * If no arguments are specified, **all** event listeners will
 * be removed.
 */
