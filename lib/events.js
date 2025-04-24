/**
 * Functions for registering event handlers.
 * @module @lumjs/web-core/events
 */

"use strict";

const core = require('@lumjs/core');
const {S,F,def,isObj} = core.types;
const {isCollection} = require('./utils');
const WSP = /\s+/;

const SS = 1;
const SF = 2;
const OO = ['capture','once','passive','signal'];

// Private function to ensure event options are assigned
function eventOptions(opts)
{
  if (!isObj(opts.opts))
  { // Generate a default set
    opts.opts = {};
    for (let o of OO)
    {
      if (o in opts)
      {
        opts.opts[o] = opts[o];
      }
    }
    Object.freeze(opts.opts);
  }
  return opts.opts;
}

/**
 * This is the old event delegation method that used positional arguments,
 * and doesn't support as many features as its replacement.
 * 
 * The positional arguments have the same names as the named arguments for
 * [onDelegatedEvent()]{@link module:@lumjs/web-core/events.onDelegatedEvent},
 * so see it for more details. I recommend replacing any code that was using
 * this to use [onEvent()]{@link module:@lumjs/web-core/events.onEvent} now.
 * It will call the new onDelegatedEvent() function automatically, while also
 * adding several more convenient features.
 * 
 * @deprecated use onEvent() or onDelegatedEvent() instead of this
 * @param {Element} target
 * @param {string}  event
 * @param {(function|object)} handle
 * @param {(string|function)} selector
 * @param {object} [opts]
 */
function addDelegatedEvent(target, event, selector, handle, opts)
{
  return onDelegatedEvent({target, event, selector, handle, opts});
}

/**
 * Register a delegated event handler.
 * 
 * Event delegation is powerful, but not exactly straightforward in the
 * regular DOM. This helps make it easier to handle. This function is used
 * by [onEvent()]{@link module:@lumjs/web-core/events.onEvent} when the
 * `selector` and/or `validate` options are found. That is the recommended
 * way to use this rather than calling it explicitly.
 * 
 * @param {object} spec - Named arguments/options.
 * 
 * Despite generally being called options, the first three are mandatory.
 * They are using the same names as the `onEvent` function, but may handle
 * some arguments differently, and have a couple additional options.
 * 
 * @param {Element} spec.target - Top-level target element.
 * @param {string}  spec.event  - DOM event we are listening for.
 * 
 * @param {(function|object)} spec.handle - The actual event handler.
 * 
 * If this is a `function` then it will be called with the matching target
 * element (delegate) as `this`, and `(event, spec)` positional arguments.
 * 
 * If this is an `object` with a `handleEvent()` method defined, then that
 * method will be called with `(event, spec)` positional arguments.
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
 * @param {(string|function)} [spec.selector] Test for delegates.
 * 
 * If this is used, then any nested children of the top-level targets that
 * are triggered as event targets may be tested to determine which one
 * of them is the actual desired target element.
 * 
 * If this is a `string` it is assumed to be a CSS-style query, and the
 * potential delegates will be tested using the `.matches()` method.
 * 
 * If this is a `function` it is assumed to be a test that will be passed
 * the potential delegate Element, as well as the DOM Event object itself, 
 * and must return a boolean value to indicate if it is a valid delegate.
 * 
 * @param {function} [spec.validate] Test for event validation.
 * 
 * If specified, this function will be passed the DOM Event object,
 * as well as the `spec` itself, and must return a boolean value to
 * indicate if the event is valid for the handler. If this returns
 * false (or anything that is treated as false in a boolean context),
 * then the selector tests will be skipped and the handler will not
 * be called at all.
 * 
 * @param {object} [spec.opts] Options for addEventListener;
 * will default to the `spec` itself if not specified.
 * 
 * @returns {function} The delegation listener method.
 * 
 * This is the function assigned using `parentElem.addEventListener()`,
 * and what you will need to pass to `parentElem.removeEventListener()`
 * in the case that you need to unregister the event handler.
 * 
 * @alias module:@lumjs/web-core/events.onDelegatedEvent
 */
function onDelegatedEvent(opts={})
{
  if (!(opts.target instanceof Element))
  {
    console.error(opts);
    throw new TypeError("Invalid parent element");
  }

  let {target: parentElem, handle: handler, selector} = opts;
  let selt = 0;
  if (typeof selector === S)      selt = SS;
  else if (typeof selector === F) selt = SF;
  
  // Internal function to find the desired delegate element.
  function findDelegate(targetElem, ev)
  {
    if (!(targetElem instanceof Element))
    { // Cannot continue, the target isn't an element.
      return null;
    }

    if (selt === SS)
    {
      if (targetElem.matches(selector))
      {
        return targetElem;
      }
    }
    else if (selt === SF)
    {
      if (selector(targetElem, ev, opts))
      {
        return targetElem;
      }
    }
    else
    { // This should not be possible, but...
      console.error("invalid selector state", {selector, opts});
      return null;
    }
    
    if (targetElem === parentElem)
    { // Cannot continue, current target is the original parent.
      return null;
    }
    
    return findDelegate(targetElem.parentElement);
  }

  const listener = function(ev)
  {
    if (typeof opts.validate === F)
    {
      if (!opts.validate(ev, opts))
      { // Validation failed, time to leave now.
        return;
      }
    }

    let delegate = selt ? findDelegate(ev.target) : parentElem;

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
        def(ev, 'target',         {value: delegate});
      }

      if (typeof handler === F)
      {
        return handler.call(delegate, ev, opts);
      }
      else if (isObj(handler) && typeof handler.handleEvent === F)
      {
        return handler.handleEvent(ev, opts);
      }
    }
  }

  parentElem.addEventListener(opts.event, listener, eventOptions(opts));

  return listener;
}

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
 * onDelegatedEvent() function to register the handler.
 * The delegation selector can also be assigned explicitly,
 * using the `{selector: stringOrFunc}` option.
 * 
 * If both `handle` and `selector` have defined values, then a further 
 * `function` argument will be used as an event validation method, and
 * onDelegatedEvent() will be used. You may also use an explicitly named
 * `{validate: function}` option to assign a validation method. That is
 * currently the only way to assign a validation method without also having
 * a `selector` in use (I am considering ways to simplify that).
 * 
 * Options for the actual `addEventListener()` call can be specified
 * as named options the same as any others. If you want to ensure they
 * are completely separate from the rest of our compiled options, 
 * you can specify the `{opts: object}` named option, but that's entirely
 * optional. Pass any of `{capture, once, passive, signal}` and they'll
 * be used in addEventListener() and removeEventListener() automatically.
 * 
 * A named option of `{off: true}` (the value _MUST_ be boolean `true`)
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
      { // Then a filter-type selector.
        opts.selector = arg;
      }
      else if (!opts.validate)
      { // Finally an event validation test.
        opts.validate = arg;
      }
      else
      {
        console.warn("handle, selector, and validate are already set",
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

  if (opts.selector || opts.validate)
  { // Something requiring delegation is required.
    opts.listener = opts.delegated = onDelegatedEvent(opts);
  }
  else
  { // No delegation, we'll assign the event listener directly.
    opts.listener = opts.handle;
    opts.target.addEventListener(
      opts.event, 
      opts.handle, 
      eventOptions(opts),
    );
  }

  if (opts.off === true)
  { // Add an off() method.
    opts.off = function()
    {
      opts.target.removeEventListener(
        opts.event, 
        opts.listener, 
        eventOptions(opts)
      );
    }
  }

  return opts;

} // onEvent()

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

exports = module.exports =
{
  addDelegatedEvent, isListener, onDelegatedEvent, onEvent, onEvents,
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
