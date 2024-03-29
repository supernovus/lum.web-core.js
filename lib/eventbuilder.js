/**
 * Functions for building and triggering DOM events.
 * @module @lumjs/web-core/eventbuilder
 */

"use strict";

const core = require('@lumjs/core');
const {S,F,isObj,needType,needObj} = core.types;

const U = require('./utils');

/**
 * A registry of DOM _event names_ to specific Event classes.
 * 
 * The classes **MUST** extend the global `Event` class.
 * 
 * Once initialized will be populated with a vast number of known
 * event names for most of the built-in event classes.
 * 
 * There are a few special properties:
 * 
 * @prop {function} _default - The `Event` constructor.
 * @prop {function} _custom - The `CustomEvent` constructor.
 * @prop {boolean} _initialized - If `$init()` has been called yet.
 * 
 * @alias module:@lumjs/web-core/eventbuilder.EventClasses
 * @type {object}
 */
const EventClasses =
{
  _default: Event,
  _custom: CustomEvent,
  _initialized: false,

  /**
   * Register new event names to a specific `Event` sub-class.
   * 
   * @param {(function|string)} eventClass - The event class;
   * must be either the classname (in `window`), or the class constructor.
   * 
   * @param {...string} eventNames - Event type names handled by the class.
   * 
   * @returns {module:@lumjs/web-core/eventbuilder.EventClasses} 
   */
  $add(eventClass, ...eventNames)
  {
    if (typeof eventClass === S)
    {
      if (typeof window[eventClass] === F)
      {
        eventClass = window[eventClass];
      }
      else
      {
        console.error("Unsupported event class", eventClass);
        if (typeof this._unsupported === F)
        {
          console.warn("Using default for unsupported events", eventClass);
          eventClass = this._unsupported;
        }
        else
        { // No class to handle these events, skip them.
          return this;
        }
      }
    }

    if (typeof eventClass !== F
      || !Event.isPrototypeOf(eventClass))
    {
      console.error({eventClass});
      throw new TypeError("Must be a sub-class of Event");
    }

    for (const ev of eventNames)
    {
      this[ev] = eventClass;
    }

    return this;
  },

  /**
   * Initialize the EventClasses registry with a large list of known events.
   * 
   * The current list of event types registered:
   * 
   * - `copy, cut, paste` → `ClipboardEvent`
   * - `blur, focus, focusin, focusout` → `FocusEvent`
   * - `keydown, keypress, keyup` → `KeyboardEvent`
   * - `auxclick, click, contextmenu, dblclick` → `MouseEvent`
   * - `mousedown, mouseenter, mouseleave, mousemove` → `MouseEvent`
   * - `mouseout, mouseover, mouseup` → `MouseEvent`
   * - `touchcancel, touchend, touchmove, touchstart` → `TouchEvent`
   * - `error` → `UIEvent`
   * - `wheel` → `WheelEvent`
   * 
   * @param {function} [unsupported] Constructor for unsupported sub-classes.
   * 
   * If the browser doesn't support a classname passed to `$add()`, then
   * by setting this, it will force the use of a specific class.
   * 
   * This is completely optional, as the `Event` fallback will always be used
   * regardless of if this was specified or not.
   * 
   * The only reason to call `$init()` manually is to specify this parameter,
   * as otherwise the registry will be initialized automatically the first 
   * time a call to the `buildEvent()` function is made.
   * 
   * @returns {module:@lumjs/web-core/eventbuilder.EventClasses}
   */
  $init(unsupported)
  {
    if (this._initialized)
    {
      console.error("Attempt to call $init() more than once");
      return this;
    }

    if (typeof unsupported === F)
    {
      this._unsupported = unsupported;
    }

    this
    .$add('ClipboardEvent', 'copy', 'cut', 'paste')
    .$add('FocusEvent', 'blur', 'focus', 'focusin', 'focusout')
    .$add('KeyboardEvent', 'keydown', 'keypress', 'keyup')
    .$add('MouseEvent', 'auxclick', 'click', 'contextmenu', 'dblclick', 
      'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout',
      'mouseover', 'mouseup')
    .$add('TouchEvent', 'touchcancel', 'touchend', 'touchmove', 'touchstart')
    .$add('UIEvent', 'error')
    .$add('WheelEvent', 'wheel')
    ;

    this._initialized = true;

    return this;
  },

} // EventClasses

/**
 * Build a new Event object given an event type name.
 * 
 * The event class will be looked up in the `EventClasses` registry.
 * So for example, if the `type` is `"click"`, `MouseEvent` will be used.
 * See {@link module:@lumjs/web-core/eventbuilder.EventClasses} for a full
 * list of event names mapped to event classes by default. Noting that
 * custom event names and classes may be added to the registry dynamically.
 * 
 * If the event name does not have a specific mapping in the registry, then
 * it will use `CustomEvent` if `options.detail` is specified, or just the
 * plain `Event` object otherwise.
 * 
 * If the browser doesn't support one of the native event classes, then the
 * generic `Event` class will be used.
 * 
 * @param {string} type - The event type name.
 * 
 * @param {object} [options] Options for the event.
 * 
 * The supported options differ depending on the event class that is used.
 * 
 * @returns {Event} An event object using the appropriate event class.
 * 
 * @alias module:@lumjs/web-core/eventbuilder.buildEvent
 */
function buildEvent(type, options={})
{
  if (!EventClasses._initialized)
  {
    EventClasses.$init();
  }

  let eventClass;

  if (typeof EventClasses[type] === F)
  {
    eventClass = EventClasses[type];
  }
  else if ('detail' in options)
  {
    eventClass = EventClasses._custom;
  }
  else
  {
    eventClass = EventClasses._default;
  }

  return new eventClass(type, options);
}

/**
 * A valid target argument for the `trigger()` function.
 * @typedef {(EventTarget|EventTarget[]|NodeList|HTMLCollection)} TriggerTarget
 */

/**
 * Result object from the `trigger()` function.
 * @typedef {object} TriggerResult
 * @prop {EventTarget} target - An individual dispatch target.
 * @prop {Event} event - The event object dispatched.
 * @prop {boolean} dispatched - The return value from `target.dispatchEvent()`
 */

/**
 * Trigger an event on one or more target(s).
 * 
 * @param {TriggerTarget} target - Target(s) to trigger event on.
 * @param {(Event|string)} event - Event to trigger.
 * @param {object} [options] Options for advanced features.
 * 
 * @param {(object|function)} [options.forEvent] Options for the event object.
 * 
 * This option is only used if the `event` argument is a `string`.
 * 
 * If this is a `function(options,target)` closure then it will be used to 
 * get the options to be passed to the event object constructor.
 * 
 * If this is an `object` it will be used as the explicit event options
 * for every event object created.
 * 
 * This will default to the `options` object itself if not specified.
 * 
 * @param {boolean} [options.singleEvent] How to handle multiple targets.
 * 
 * This option is only used if the `event` argument is a `string`.
 * 
 * If this is `false` we generate a new `Event` object for each target.
 * In this case the `target` passed to a `forEvent` function would be
 * each individual target (if there are multiple.)
 * 
 * If this is `true` then we'll generate a single `Event` object and use 
 * it for every target. In this case the `target` passed to a `forEvent`
 * function will always be an iterable collection of targets.
 * If the original `target` was a single `EventTarget` object, then it
 * will be wrapped in an `Array` to ensure it is a valid collection.
 * 
 * If this is not specified, it's default value will be `false` if
 * `options.forEvent` is a `function`, or `true` in any other case.
 * 
 * @returns {TriggerResult[]} An array of dispatch results.
 * 
 * @alias module:@lumjs/web-core/eventbuilder.trigger
 */
function trigger(target, event, options={})
{
  if (target instanceof EventTarget)
  { // A single target, wrap it in an array for the logic loop below.
    target = [target];
  }
  else if (!U.isCollection(target, EventTarget))
  { // Not an EventTarget or a collection of event targets?
    console.error({target, event, options});
    throw new TypeError("Invalid event target");
  }

  let getOpts;

  if (typeof event === S)
  { // A string event name, we're going to build the event.

    const fnOpts = (typeof options.forEvent === F);
    const single = options.singleEvent ?? !fnOpts;

    if (fnOpts)
    { // A closure to get options for each event.
      getOpts = options.forEvent;
    }
    else if (isObj(options.forEvent))
    { // Specified options explicitly for the event(s).
      getOpts = () => options.forEvent;
    }
    else
    { // Defaulting to using the general options for all events.
      getOpts = () => options;
    }

    if (single)
    { // Build a single event for all nodes.
      event = buildEvent(event, getOpts(options, target));
    }
  }
  else if (!(event instanceof Event))
  {
    throw new TypeError("event must be a string or Event object");
  }

  const results = [];

  for (const node of target)
  {
    const evObj 
      = (typeof event === S)
      ? buildEvent(event, getOpts(options, node))
      : event;

    const dispatched = node.dispatchEvent(evObj);
    
    results.push({target: node, event: evObj, dispatched});
  }

  return results;
}

module.exports =
{
  EventClasses, buildEvent, trigger,
}
