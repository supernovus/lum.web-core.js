/**
 * UI related functions.
 * @module @lumjs/web-core/ui
 */
"use strict";

const core = require('@lumjs/core');
const {N,isObj} = core.types;

/**
 * Get the opacity of an element.
 * 
 * Uses the _computed style_ so cascading styles work properly.
 * 
 * @param {Element} elem - Element to find opacity of.
 * @param {object} [opts] Options
 * 
 * @param {boolean} [opts.visibility] Consider `visibility` ?
 * 
 * If this is `true` and the `computedStyle.visibility` is anything
 * other than `'visible'`, the function will return `0`.
 * 
 * @param {boolean} [opts.display] Consider `display` ?
 * 
 * If this is `true` and the `computedStyle.display` is `'none'`, 
 * the function will return `0`.
 * 
 * @param {boolean} [opts.hidden] Consider `hidden` ?
 * 
 * If this is `true` and `elem.hidden` is true, the function
 * will return `0`.
 * 
 * @param {boolean} [opts.allProps=false] Set default for above options.
 * 
 * This is a convenience option used to set the default value for:
 * - `opts.visibility`
 * - `opts.display`
 * - `opts.hidden`
 * Can be used to enable all of those in one shot.
 * 
 * @param {boolean} [opts.asPercent=true] Return as a percentage?
 * 
 * If this is `true` (default), returns a number between `0` and `100`.
 * If `false`, returns a number between `0` and `1` (the CSS value).
 * 
 * @returns {number}
 * @alias module:@lumjs/web-core/ui.opacityOf
 */
function opacityOf(elem, opts={})
{
  const asPercent = opts.asPercent  ?? true;
  const useOther  = opts.allProps   ?? false;
  const useVis    = opts.visibility ?? useOther;
  const useDis    = opts.display    ?? useOther;
  const useHid    = opts.hidden     ?? useOther;
  
  const compStyle = getComputedStyle(elem);

  let opVal;

  if (useHid && elem.hidden)
  {
    opVal = 0;
  }
  else if (useVis && compStyle.visibility !== 'visible')
  {
    opVal = 0;
  }
  else if (useDis && compStyle.display === 'none')
  {
    opVal = 0;
  }
  else
  { // The main meat of the method.
    opVal = parseFloat(compStyle.opacity);

    if (isNaN(opVal) || opVal < 0 || opVal > 1)
    { 
      console.warn("Invalid opacity CSS value", {opVal});
      opVal = 1;
    }
  }

  return (asPercent ? (opVal * 100) : opVal);
}

/**
 * Get the position to move an element to using the pointer
 * position as the basis.
 * 
 * This is mostly designed to be used with context menus and
 * other popup dialogs that you want to appear near where you
 * clicked/pressed on the window.
 * 
 * Takes the window dimensions into account so that the element
 * isn't moved to a position where it's partially outside the
 * usable window area.
 * 
 * @alias module:@lumjs/web-core/ui.getTargetPos
 * 
 * @param {Element} elem - The main dialog element we're positioning.
 * 
 * Note: if the element is not currently visible on the screen, 
 * the `clientWidth` and `clientHeight` _may_ return a value of `0`, 
 * which will invalidate the returned positioning information.
 * 
 * @param {(Event|Touch)} event - UI Event with positioning info.
 * 
 * Works with any event with `clientX` and `clientY` properties,
 * such as `MouseEvent` and its sub-classes.
 * 
 * If this is a `TouchEvent`, it will use `event.touches[0]`
 * for the source of the `clientX` and `clientY` values.
 * 
 * If this does not have `clientX` or `clientY` values, 
 * or is any value other than an `object`, then both values will 
 * default to `0`.
 * 
 * @returns {module:@lumjs/web-core/ui~Pos}
 * @throws {TypeError} If `elem` is not a valid Element object.
 */
function getTargetPos(elem, event)
{
  if (!(elem instanceof Element))
  {
    throw new TypeError("Invalid element");
  }

  if (!isObj(event)) event = {}; // Empty event.

  const pos = {},
        eo = (event instanceof TouchEvent) ? event.touches[0] : event,
        dp = {x: elem.clientWidth,   y: elem.clientHeight},
        wp = {x: window.innerWidth,  y: window.innerHeight},
        ep = {x: eo.clientX ?? 0,    y: eo.clientY ?? 0};

  pos.x = (ep.x + dp.x > wp.x)
    ? (ep.x - dp.x)
    : ep.x;

  if (pos.x < 0) pos.x = 0;

  pos.y = (ep.y + dp.y > wp.y)
    ? (ep.y - dp.y)
    : ep.y;

  if (pos.y < 0) pos.y = 0;

  return pos;
}

/**
 * Is the passed value a valid position object?
 * @alias module:@lumjs/web-core/ui.isPos
 * @param {*} v - Value to test 
 * @returns {boolean}
 * @see module:@lumjs/web-core/ui~Pos
 */
function isPos(v)
{
  return (isObj(v) && typeof v.x === N && typeof v.y === N);
}

/**
 * Reposition an element on the page
 * 
 * @param {Element} elem - Element to be repositioned
 * @param {(Event|module:@lumjs/web-core/ui~Pos)} pos 
 * Either an event to pass to `getTargetPos()` or a position object
 * @param {object} [opts] Options
 * @param {boolean} [opts.reset=false] Reset `elem.style` before
 * making any other changes?
 * @param {object} [opts.style] Properties to assign to `elem.style`
 * before setting the `left` and `top` to the `pos` coordinates.
 * 
 * @returns {Element} The `elem` after moving
 */
function reposition(elem, pos, opts={})
{
  if (pos instanceof Event)
  { // Get the position info from the event
    pos = getTargetPos(elem, pos);
  }
  else if (!isPos(pos))
  { // That's not valid
    console.error({pos, elem, opts});
    throw new TypeError("Invalid pos argument");
  }

  if (opts.reset)
  { // Reset the CSS styles back to their default state
    elem.style = null;
  }

  if (isObj(opts.style))
  {
    for (const key in opts.style)
    {
      elem.style[key] = opts.style[key]
    }
  }

  // Now set the position using `left` and `top`
  elem.style.left = pos.x+'px';
  elem.style.top  = pos.y+'px';

  return elem;
}

module.exports =
{
  opacityOf, getTargetPos, isPos, reposition,
}

/**
 * Position object
 * 
 * May have other properties, but MUST have `x` and `y`.
 * 
 * @typedef {object} module:@lumjs/web-core/ui~Pos
 * @prop {number} x - Horizontal coordinate
 * @prop {number} y - Vertical coordinate
 */
