/**
 * UI related functions.
 * @module @lumjs/web-core/ui
 */
"use strict";

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

exports.opacityOf = opacityOf;
